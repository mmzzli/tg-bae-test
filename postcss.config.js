export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 16, // 基准值，1rem = 16px（可以根据设计稿调整）
      propList: ['*', '!padding*', '!margin*'], // 排除 padding 和 margin 相关属性
      unitPrecision: 5, // rem单位的小数精度
      selectorBlackList: [], // 不进行转换的选择器列表
      replace: true, // 替换而不是添加备用单位
      mediaQuery: false, // 是否允许在媒体查询中转换
      minPixelValue: 2, // 最小的转换单位（小于该值的 px 不会被转换）
    },
  },
}
