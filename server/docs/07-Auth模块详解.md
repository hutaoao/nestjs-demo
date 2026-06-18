# ⑦ Auth 模块详解 — 认证/授权/JWT/Guard/装饰器

## 业务背景

Auth 模块实现了经典的"注册 → 登录 → 鉴权 → 授权"完整链路：

```
                    ┌──────────────────────┐
                    │    用户注册           │
                    │  POST /auth/register  │
                    └──────────┬───────────┘
                               │ 返回 JWT Token
                               ▼
                    ┌──────────────────────┐
                    │    用户登录           │
                    │  POST /auth/login     │
                    └──────────┬───────────┘
                               │ 返回 JWT Token
                               ▼
                    ┌──────────────────────┐
                    │  使用 Token 访问资源   │
                    │  Authorization: Bearer │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │ GET /auth/   │  │ POST /posts  │  │ POST /tags   │
     │ profile      │  │ (需登录)      │  │ (需 admin)   │
     └──────────────┘  └──────────────┘  └──────────────┘
```

## 文件清单（10 个）

```typescript
src/modules/auth/
├── auth.module.ts          // 认证模块（@Global，导出 Guard/Strategy）
├── auth.controller.ts      // 控制器：register / login / profile
├── auth.service.ts         // 业务服务：注册(哈希密码) / 登录(签发JWT)
├── dto/
│   ├── register.dto.ts     // 注册 DTO：username + email + password
│   └── login.dto.ts        // 登录 DTO：email + password
├── strategies/
│   └── jwt.strategy.ts     // Passport JWT 策略（解码 Token + 查用户）
├── guards/
│   ├── jwt-auth.guard.ts   // JWT 认证守卫（检查 @Public 装饰器）
│   └── roles.guard.ts      // 角色授权守卫（检查 @Roles 装饰器）
└── decorators/
    ├── roles.decorator.ts   // @Roles('admin') 标记需要什么角色
    └── public.decorator.ts  // @Public() 跳过 JWT 认证
```

## 认证流程拆解

### 步骤 1：注册（哈希密码）

```typescript
// auth.service.ts
async register(dto: RegisterDto) {
  // ① 查邮箱是否已存在
  const existing = await this.db.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new ConflictException('该邮箱已被注册');

  // ② bcrypt 哈希密码（绝对不能存明文！）
  const hashedPassword = bcrypt.hashSync(dto.password, 10);

  // ③ 创建用户（存哈希后的密码）
  const user = await this.db.user.create({
    data: { username: dto.username, email: dto.email, password: hashedPassword },
  });

  // ④ 签发 JWT Token 返回给前端
  const token = this.generateToken(user.id, user.role);
  return { access_token: token, user: { id: user.id, username: user.username, email: user.email } };
}
```

### 步骤 2：登录（校验密码）

```typescript
async login(dto: LoginDto) {
  const user = await this.db.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new UnauthorizedException('邮箱或密码错误');

  const isPasswordValid = bcrypt.compareSync(dto.password, user.password);
  if (!isPasswordValid) throw new UnauthorizedException('邮箱或密码错误');

  const token = this.generateToken(user.id, user.role);
  return { access_token: token, user: { id: user.id, username: user.username, email: user.email } };
}
```

### 步骤 3：JWT 签发

```typescript
// 在 JWT payload 中存放 userId 和 role
private generateToken(userId: number, role: string): string {
  return this.jwtService.sign({ userId, role });  // payload 被 base64 + HS256 签名
}
```

### 步骤 4：JWT 验证（Passport Strategy）

```typescript
// jwt.strategy.ts — 核心流程：
// ① 从 Authorization: Bearer xxx 提取 Token
// ② 用 JWT_SECRET 解码 Token → 得到 { userId, role }
// ③ 去数据库查用户是否存在
// ④ 把用户信息挂到 request.user
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private readonly db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.db.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new UnauthorizedException('用户不存在');
    return { userId: user.id, username: user.username, role: user.role };
  }
}
```

### 步骤 5：守卫检查

**JwtAuthGuard**：检查请求是否携带有效的 JWT Token

```typescript
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // 先看方法上是否有 @Public() 装饰器
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),     // 当前调用的方法
      context.getClass(),       // 当前调用的类（Controller）
    ]);
    if (isPublic) return true;   // @Public 标记 → 跳过认证
    return super.canActivate(context);  // 否则验证 JWT
  }
}
```

**RolesGuard**：检查用户角色是否在允许列表中

```typescript
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),    // 执行上下文：拿到当前方法
      context.getClass(),      // 执行上下文：拿到当前类
    ]);
    if (!requiredRoles) return true;  // 无角色要求 → 放行

    const request = context.switchToHttp().getRequest();
    return requiredRoles.includes(request.user?.role ?? '');
  }
}
```

## 关键概念问答

### Q: @Global() 有什么用？
A: 加在 AuthModule 上，让 JwtAuthGuard/RolesGuard 在所有模块中直接可用。不加的话，PostsModule 想用 JwtAuthGuard 就必须在 imports 里显式导入 AuthModule。

### Q: bcrypt 为什么不能改成 MD5/SHA256？
A: bcrypt 是故意"慢"的哈希算法（计算一次约 10ms），暴力破解成本极高。MD5 和 SHA256 是"快"哈希（计算一次 < 0.001ms），GPU 可以每秒算数亿次，被破解只是时间问题。

### Q: JWT payload 里放了什么？
A: `{ userId: number, role: string }`。不放密码/手机号等敏感信息，因为 JWT 的 payload 只是 base64 编码（不是加密），任何人都可以解码看到内容。

### Q: @Roles 和 @Public 装饰器的原理？
A: 用 `SetMetadata` 把元数据"贴"到方法上，然后 Guard 用 `Reflector`（反射器）读取这些元数据。类似于在函数上贴了一张便利贴。
