/**
 * ─────────────────────────────────────────────
 *  configuration.ts — 环境变量配置
 * ─────────────────────────────────────────────
 * 集中管理所有从 .env 文件读取的环境变量。
 *
 * 为什么要这样做？
 * 如果不集中管理，你在代码里到处写 process.env.xxx，
 * 哪天想加个默认值或改个变量名就要搜遍全项目。
 * 集中在这里，一目了然。
 */

// 导出一个函数（配置工厂），返回一个配置对象
// ConfigModule 加载后，通过 ConfigService.get('port') 获取值
export default () => ({
  // parseInt 把字符串转数字，|| 3000 是默认值
  port: parseInt(process.env.PORT!, 10) || 3000,
  // database 对象下可以继续扩展（将来加 host、port、user 等）
  database: {
    // 感叹号 ! 是 TypeScript 的非空断言，告诉 TS："这个变量一定有值"
    url: process.env.DATABASE_URL!,
  },
});
