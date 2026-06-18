/**
 * ─────────────────────────────────────────────
 *  auth.service.ts — 认证业务服务
 * ─────────────────────────────────────────────
 *
 * 负责"注册、登录、验证用户"三个核心认证功能。
 *
 * 前端类比：相当于一个 authStore（Pinia/Vuex）：
 *   const authStore = {
 *     register(username, email, password) { ... },  // 注册
 *     login(email, password) { ... },               // 登录
 *     getProfile() { ... },                         // 获取当前用户信息
 *   }
 *
 * 常见问题：
 *   Q: bcrypt 是啥？
 *   A: 一个密码哈希库。密码不能明文存数据库！
 *      bcrypt.hashSync(password, 10) 把密码变成一串乱码，
 *      bcrypt.compareSync(password, hash) 验证密码是否匹配。
 *      特点是"慢"——故意慢，让暴力破解的成本极高。
 *
 *   Q: JwtService 是 @nestjs/jwt 提供的吗？
 *   A: 对。它负责签发 Token（sign）和验证 Token（verify）。
 *      我们这里只用 sign——验证由 Passport 的 JwtStrategy 来做。
 *
 *   Q: signAsync 里的 payload 是啥？
 *   A: JWT 的三段式：header.payload.signature
 *      payload 就是中间那段，存着{ userId, role }。
 *      不要放敏感信息（如密码）到 payload 里，
 *      因为 JWT 只是签名防篡改，内容本身是 base64 可解码的。
 */

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../core/database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  // ── 注册 ──
  async register(dto: RegisterDto) {
    // 1. 检查邮箱是否已被注册（唯一约束）
    const existing = await this.db.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 2. 密码哈希（绝对不能明文存库！）
    // bcrypt.hashSync(password, saltRounds)
    // saltRounds = 10：计算 2^10 = 1024 轮哈希
    // 轮数越高越安全，但也越慢（10 是比较合理的平衡值）
    const hashedPassword = bcrypt.hashSync(dto.password, 10);

    // 3. 创建用户（存哈希后的密码）
    const user = await this.db.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        // role 不传，默认 "user"
      },
    });

    // 4. 签发 JWT Token，返回给前端
    const token = this.generateToken(user.id, user.role);

    return {
      access_token: token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }

  // ── 登录 ──
  async login(dto: LoginDto) {
    // 1. 根据邮箱查找用户
    const user = await this.db.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 2. 用 bcrypt 比对密码
    const isPasswordValid = bcrypt.compareSync(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 3. 签发 JWT Token
    const token = this.generateToken(user.id, user.role);

    return {
      access_token: token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }

  // ── 获取用户信息 ──
  async getProfile(userId: number) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      // 不返回 password 给前端
      select: { id: true, username: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    return user;
  }

  // ── 私有的 Token 生成方法 ──
  // 在 JWT payload 中存放 userId 和 role
  // Payload 会被 base64 编码 + HS256 签名，生成形如：
  // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx.yyy
  private generateToken(userId: number, role: string): string {
    return this.jwtService.sign({ userId, role });
  }
}
