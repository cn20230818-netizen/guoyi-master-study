export const literatureWatchConfig = {
  generatedLabel: '自动检索公开线索',
  note: '以下内容来自公开网页检索结果与公开站点页面抓取，仅作为待审核更新线索，不等于已通读封闭数据库全文。',
  masters: {
    zhang: {
      queries: [
        '张学文 国医大师 脑病',
        '张学文 中风 痫证 眩晕 痴呆 国医大师',
      ],
      preferredDomains: [
        'szyyj.gd.gov.cn',
        'zyhos.cn',
        'shzyyzz.shzyyzz.com',
        '90.hnucm.edu.cn',
        'zynj.shutcm.edu.cn',
      ],
    },
    liu: {
      queries: [
        '刘祖贻 国医大师 脑病',
        '刘祖贻 中风后遗症 痫证 颤证 国医大师',
      ],
      preferredDomains: [
        '90.hnucm.edu.cn',
        'shzyyzz.shzyyzz.com',
        'szyyj.gd.gov.cn',
        'zynj.shutcm.edu.cn',
      ],
    },
    tu: {
      queries: [
        '凃晋文 国医大师 脑病',
        '凃晋文 眩晕 痴呆 失眠 国医大师',
      ],
      preferredDomains: [
        'szyyj.gd.gov.cn',
        'shzyyzz.shzyyzz.com',
        'zynj.shutcm.edu.cn',
      ],
    },
  },
};
