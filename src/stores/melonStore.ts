// Mock melon list for all pages to use
export interface MockMelon {
  id: string;
  title: string;
  description: string;
  category: '即时瓜条' | '上古瓜条';
  status: 'live' | 'dying' | 'dead' | 'revived';
  onlineCount: number;
  lastEdited: string;
  retentionTotal: number;
  retentionRemaining: number;
  heatScore: number;
  creator: string;
  historicalHeat?: number;
  deathDate?: string;
  revivalCount?: number;
}

export interface MockCell {
  row: number;
  col: number;
  content: string;
  isRowHeader?: boolean;
  color?: string;
  isPoster?: boolean;
  span?: { rows: number; cols: number };
  posterText?: string;
  isWarning?: boolean;
  isConsensus?: boolean;
}

export interface MockSheet {
  id: string;
  name: string;
  cells: MockCell[];
}

export interface MockMelonData {
  title: string;
  creator: string;
  status: 'live' | 'dying' | 'dead' | 'revived';
  onlineCount: number;
  retentionRemaining: number;
  retentionTotal: number;
  sheets: MockSheet[];
}

export const mockMelons: MockMelon[] = [
  {
    id: '1',
    title: '综艺宿舍疑存健康隐患，多名艺人身体不适',
    description: '热门女团竞技综艺多位艺人出现头晕、过敏、流鼻血等症状，网友质疑住宿区装修超标',
    category: '即时瓜条',
    status: 'live',
    onlineCount: 7231,
    lastEdited: '10秒前',
    retentionTotal: 86400,
    retentionRemaining: 82100,
    heatScore: 97000,
    creator: '综艺猹',
  },
  {
    id: '2',
    title: '真人秀嘉宾分寸感遭全网热议',
    description: '高人气女艺人户外真人秀中被指调侃前辈、有失礼节，路人口碑明显下滑',
    category: '即时瓜条',
    status: 'live',
    onlineCount: 5640,
    lastEdited: '25秒前',
    retentionTotal: 43200,
    retentionRemaining: 39800,
    heatScore: 94000,
    creator: '娱乐猹',
  },
  {
    id: '3',
    title: '人气女艺人新恋情曝光，当事人态度暧昧',
    description: '新生代女歌手与圈外男子亲密同行被拍，回应措辞模糊未正面承认',
    category: '即时瓜条',
    status: 'live',
    onlineCount: 8912,
    lastEdited: '1分钟前',
    retentionTotal: 86400,
    retentionRemaining: 81200,
    heatScore: 99000,
    creator: '吃瓜猹',
  },
  {
    id: '4',
    title: '网购纠纷：商家跨城追讨恶意索赔',
    description: '消费者"仅退款不退货"恶意索赔，商家无奈跨城上门维权引热议',
    category: '即时瓜条',
    status: 'live',
    onlineCount: 3245,
    lastEdited: '5分钟前',
    retentionTotal: 43200,
    retentionRemaining: 36500,
    heatScore: 85000,
    creator: '理性猹友',
  },
  {
    id: '5',
    title: '多地校园问题集中曝光，食品安全受关注',
    description: '校园餐食、违规校外培训等问题接连曝光，未成年人权益成焦点',
    category: '即时瓜条',
    status: 'dying',
    onlineCount: 1876,
    lastEdited: '18分钟前',
    retentionTotal: 3600,
    retentionRemaining: 980,
    heatScore: 78000,
    creator: '社会猹',
  },
  {
    id: '6',
    title: '昔日顶流女星深陷多重丑闻，被行业全面封杀',
    description: '违背公序良俗争议、天价劳务、税务违规，最终推动文娱行业专项整顿',
    category: '上古瓜条',
    status: 'dead',
    onlineCount: 0,
    lastEdited: '5天前',
    retentionTotal: 0,
    retentionRemaining: 0,
    heatScore: 995000,
    creator: '瓜田守望者',
    historicalHeat: 995000,
    deathDate: '2026-05-20',
    revivalCount: 0,
  },
  {
    id: '7',
    title: '初代男顶流涉嫌严重违法，终审获刑驱逐出境',
    description: '多位网友实名举报，司法审理后判重刑附加驱逐出境，圈内警示性反面案例',
    category: '上古瓜条',
    status: 'dead',
    onlineCount: 0,
    lastEdited: '1周前',
    retentionTotal: 0,
    retentionRemaining: 0,
    heatScore: 988000,
    creator: '理性猹友',
    historicalHeat: 988000,
    deathDate: '2026-04-15',
    revivalCount: 0,
  },
  {
    id: '8',
    title: '恶性纵火案余波不断，反复引发全民讨论',
    description: '保姆纵火恶性案件判决落地后，当事人后续生活、传闻常年反复发酵',
    category: '上古瓜条',
    status: 'revived',
    onlineCount: 4123,
    lastEdited: '3小时前',
    retentionTotal: 86400,
    retentionRemaining: 52000,
    heatScore: 920000,
    creator: '社会猹',
    historicalHeat: 920000,
    revivalCount: 4,
  },
]

export const mockMelonSheets: Record<string, MockMelonData> = {
  '1': {
    title: '综艺宿舍疑存健康隐患，多名艺人身体不适',
    creator: '综艺猹',
    status: 'live',
    onlineCount: 7231,
    retentionRemaining: 82100,
    retentionTotal: 86400,
    sheets: [
      {
        id: 's1',
        name: '吃瓜区',
        cells: [
          { row: 1, col: 0, content: '', isRowHeader: true },
          { row: 1, col: 1, content: '', isPoster: true, span: { rows: 2, cols: 6 }, color: '#FFEBEE', posterText: '⚠️ 综艺甲醛逃生真人秀\n节目组：这是竞技综艺\n参赛姐姐：这是在拿命竞技\n装修队：别问，问就是通通风就好了' },
          { row: 3, col: 0, content: '', isRowHeader: true },
          { row: 3, col: 1, content: '头晕流鼻血我还以为是行程太满，结果是宿舍的锅', color: '#FFEBEE' },
          { row: 3, col: 2, content: '这节目组是打算让姐姐们练铁肺吗，甲醛浓度里唱跳rap' },
          { row: 4, col: 0, content: '', isRowHeader: true },
          { row: 4, col: 1, content: '节目组：我们检测报告是合规的', color: '#E3F2FD' },
          { row: 4, col: 2, content: '笑死，自己找的检测机构，我还能给自己开个三甲医院的假条呢' },
          { row: 5, col: 0, content: '', isRowHeader: true },
          { row: 5, col: 1, content: '业内人士爆料装修完不到一周就入住了', color: '#FFEBEE' },
          { row: 5, col: 2, content: '装修工人都得等俩月才住，明星不如装修工系列' },
          { row: 6, col: 0, content: '', isRowHeader: true },
          { row: 6, col: 1, content: '🟢 共识：建议节目改名《乘风2026·甲醛求生》', color: '#E8F5E9', isConsensus: true },
          { row: 6, col: 2, content: '人选个第三方机构吧，别自欺欺人了，姐姐们的命也是命啊' },
          { row: 7, col: 0, content: '', isRowHeader: true },
          { row: 7, col: 1, content: '🔴 已经有选手因身体原因退赛了', color: '#FFEBEE', isWarning: true },
          { row: 7, col: 2, content: '退赛：个人原因。翻译：再不跑就要吸出职业病了' },
          { row: 8, col: 0, content: '', isRowHeader: true },
          { row: 8, col: 1, content: '赞助商连夜开会.jpg', color: '#FFF8E1' },
          { row: 8, col: 2, content: '我要是金主爸爸我也慌，这口碑比甲醛还毒' },
          { row: 9, col: 0, content: '', isRowHeader: true },
          { row: 9, col: 1, content: '有没有课代表总结一下现在什么情况', color: '#F3E5F5' },
          { row: 9, col: 2, content: '课代表：节目组省钱→装修赶工→甲醛超标→姐姐们病倒→粉丝开撕→节目组掏出一份自己写的"合规报告"→大家接着吵' },
        ],
      },
      {
        id: 's2',
        name: '证据区',
        cells: [
          { row: 1, col: 0, content: '', isRowHeader: true },
          { row: 1, col: 1, content: '📎 节目组出具的环境检测报告（截图）' },
          { row: 2, col: 0, content: '', isRowHeader: true },
          { row: 2, col: 1, content: '📎 退赛艺人声明原文截图' },
          { row: 3, col: 0, content: '', isRowHeader: true },
          { row: 3, col: 1, content: '📎 录制基地宿舍完工日期实拍' },
          { row: 4, col: 0, content: '', isRowHeader: true },
          { row: 4, col: 1, content: '📎 去年同节目组就被曝过住宿环境差（旧帖存档）' },
        ],
      },
    ],
  },
  '2': {
    title: '真人秀嘉宾分寸感遭全网热议',
    creator: '娱乐猹',
    status: 'live',
    onlineCount: 5640,
    retentionRemaining: 39800,
    retentionTotal: 43200,
    sheets: [
      {
        id: 's1',
        name: '吃瓜区',
        cells: [
          { row: 1, col: 0, content: '', isRowHeader: true },
          { row: 1, col: 1, content: '', isPoster: true, span: { rows: 2, cols: 6 }, color: '#FFF8E1', posterText: '🎬 真人秀"分寸感"大讨论\n一句话总结：综艺效果≠没礼貌\n但剪辑有没有添油加醋呢？' },
          { row: 3, col: 0, content: '', isRowHeader: true },
          { row: 3, col: 1, content: '看完了正片，属实有点尴尬，脚趾扣出三室一厅', color: '#FFEBEE' },
          { row: 3, col: 2, content: '前辈那表情我看了都心疼，还得笑着打圆场，这才是专业素养' },
          { row: 4, col: 0, content: '', isRowHeader: true },
          { row: 4, col: 1, content: '其实剪辑问题也很大', color: '#E3F2FD' },
          { row: 4, col: 2, content: '节目组老套路了，恶意剪辑制造话题，但本人确实也有点飘了' },
          { row: 5, col: 0, content: '', isRowHeader: true },
          { row: 5, col: 1, content: '但她以前不是这样的啊，是不是团队最近换人了', color: '#FFF8E1' },
          { row: 5, col: 2, content: '红了就开始忘本了呗，娱乐圈经典剧本' },
          { row: 6, col: 0, content: '', isRowHeader: true },
          { row: 6, col: 1, content: '🟢 结论：这个度确实没把握好', color: '#E8F5E9', isConsensus: true },
          { row: 6, col: 2, content: '年轻人想表现自己能理解，但不能踩着别人上位啊' },
          { row: 7, col: 0, content: '', isRowHeader: true },
          { row: 7, col: 1, content: '粉丝别洗了，路人都看不下去了', color: '#FFEBEE' },
          { row: 7, col: 2, content: '笑死，粉丝控评文案：这叫"真实不做作"。真实≠没礼貌好吧' },
        ],
      },
      {
        id: 's2',
        name: '证据区',
        cells: [
          { row: 1, col: 0, content: '', isRowHeader: true },
          { row: 1, col: 1, content: '📎 争议片段完整版视频（未剪辑）' },
          { row: 2, col: 0, content: '', isRowHeader: true },
          { row: 2, col: 1, content: '📎 节目组回应声明' },
        ],
      },
    ],
  },
  '3': {
    title: '人气女艺人新恋情曝光，当事人态度暧昧',
    creator: '吃瓜猹',
    status: 'live',
    onlineCount: 8912,
    retentionRemaining: 81200,
    retentionTotal: 86400,
    sheets: [
      {
        id: 's1',
        name: '吃瓜区',
        cells: [
          { row: 1, col: 0, content: '', isRowHeader: true },
          { row: 1, col: 1, content: '', isPoster: true, span: { rows: 2, cols: 6 }, color: '#F3E5F5', posterText: '💕 新生代女歌手恋情疑曝光\n狗仔拍了又拍，当事人说了又好像没说\n娱乐圈年度暧昧大戏开幕' },
          { row: 3, col: 0, content: '', isRowHeader: true },
          { row: 3, col: 1, content: '对方是个素人？那基本锤了', color: '#F3E5F5' },
          { row: 3, col: 2, content: '明星不会让没关系的素人大白天一起逛街的，懂的都懂' },
          { row: 4, col: 0, content: '', isRowHeader: true },
          { row: 4, col: 1, content: '回应措辞模糊 = 是真的但还没想好怎么公开', color: '#FFF8E1' },
          { row: 4, col: 2, content: '翻译一下她的回应："谢谢关心" = "是真的但别问了"的娱乐圈标准话术' },
          { row: 5, col: 0, content: '', isRowHeader: true },
          { row: 5, col: 1, content: '上次采访还说享受单身，我就知道快了', color: '#E3F2FD' },
          { row: 5, col: 2, content: '娱乐圈潜规则：说"目前单身"=还在暧昧，"享受单身"=已经在谈了' },
          { row: 6, col: 0, content: '', isRowHeader: true },
          { row: 6, col: 1, content: '🟢 盲猜：一个月内正式官宣', color: '#E8F5E9', isConsensus: true },
          { row: 6, col: 2, content: '先让舆论适应一下，再找个好日子公开，公关团队基本是这个流程' },
          { row: 7, col: 0, content: '', isRowHeader: true },
          { row: 7, col: 1, content: '祝福吧，女明星也该谈甜甜的恋爱了', color: '#E8F5E9' },
          { row: 7, col: 2, content: '男方看着挺清爽的，比之前传的那些牛鬼蛇神强多了' },
          { row: 8, col: 0, content: '', isRowHeader: true },
          { row: 8, col: 1, content: '狗仔的文案比工作室声明还有文学水平', color: '#FFF8E1' },
          { row: 8, col: 2, content: '笑死，卓伟退休后内娱狗仔的文笔是一代不如一代了' },
        ],
      },
      {
        id: 's2',
        name: '证据区',
        cells: [
          { row: 1, col: 0, content: '', isRowHeader: true },
          { row: 1, col: 1, content: '📎 狗仔拍摄视频/照片' },
          { row: 2, col: 0, content: '', isRowHeader: true },
          { row: 2, col: 1, content: '📎 当事人回应全文' },
          { row: 3, col: 0, content: '', isRowHeader: true },
          { row: 3, col: 1, content: '📎 男方背景梳理（圈外人）' },
        ],
      },
    ],
  },
  '4': {
    title: '网购纠纷：商家跨城追讨恶意索赔',
    creator: '理性猹友',
    status: 'live',
    onlineCount: 3245,
    retentionRemaining: 36500,
    retentionTotal: 43200,
    sheets: [
      {
        id: 's1',
        name: '吃瓜区',
        cells: [
          { row: 1, col: 0, content: '', isRowHeader: true },
          { row: 1, col: 1, content: '', isPoster: true, span: { rows: 2, cols: 6 }, color: '#E3F2FD', posterText: '📦 "仅退款"到底有多坑？\n白嫖党：这是消费者的权利\n商家：那我跨城上门来要个说法\n平台：我定的规则，我负责和稀泥' },
          { row: 3, col: 0, content: '', isRowHeader: true },
          { row: 3, col: 1, content: '仅退款不退货？这不就是白嫖吗……', color: '#FFEBEE' },
          { row: 3, col: 2, content: '好家伙，零元购合法化了是吧，PDD带货主播都不敢这么教' },
          { row: 4, col: 0, content: '', isRowHeader: true },
          { row: 4, col: 1, content: '虽然商家上门有点极端，但我理解', color: '#FFF8E1' },
          { row: 4, col: 2, content: '被逼急了呗，几块钱的东西还要跨城跑一趟，换谁不气' },
          { row: 5, col: 0, content: '', isRowHeader: true },
          { row: 5, col: 1, content: '问题根源是平台规则', color: '#E3F2FD' },
          { row: 5, col: 2, content: '"仅退款"这个选项就离谱，平台为了讨好消费者把商家当韭菜割' },
          { row: 6, col: 0, content: '', isRowHeader: true },
          { row: 6, col: 1, content: '🟢 共识：仅退款可以但必须退货', color: '#E8F5E9', isConsensus: true },
          { row: 6, col: 2, content: '不退货就该纳入征信，这帮白嫖党把市场搞坏了最后还不是消费者买单' },
          { row: 7, col: 0, content: '', isRowHeader: true },
          { row: 7, col: 1, content: '有一说一，这商家也是猛人', color: '#FFF8E1' },
          { row: 7, col: 2, content: '跨城上门追几块钱的货，这个执行力干点啥不好……' },
          { row: 8, col: 0, content: '', isRowHeader: true },
          { row: 8, col: 1, content: '🔴 小心反转：如果买家是恶意投诉专业户呢', color: '#FFEBEE', isWarning: true },
          { row: 8, col: 2, content: '有些人专门靠"仅退款"薅羊毛，一年能薅几万，商家遇到这种确实没办法' },
        ],
      },
      {
        id: 's2',
        name: '证据区',
        cells: [
          { row: 1, col: 0, content: '', isRowHeader: true },
          { row: 1, col: 1, content: '📎 商家上门维权完整视频' },
          { row: 2, col: 0, content: '', isRowHeader: true },
          { row: 2, col: 1, content: '📎 平台"仅退款"规则条款截图' },
          { row: 3, col: 0, content: '', isRowHeader: true },
          { row: 3, col: 1, content: '📎 类似案例：多地商家遭遇恶意仅退款汇总' },
        ],
      },
    ],
  },
  '5': {
    title: '多地校园问题集中曝光，食品安全受关注',
    creator: '社会猹',
    status: 'dying',
    onlineCount: 1876,
    retentionRemaining: 980,
    retentionTotal: 3600,
    sheets: [
      {
        id: 's1',
        name: '吃瓜区',
        cells: [
          { row: 1, col: 0, content: '', isRowHeader: true },
          { row: 1, col: 1, content: '', isPoster: true, span: { rows: 2, cols: 6 }, color: '#FFF8E1', posterText: '🏫 校园安全年年提，问题年年有\n食堂的菜是黄的，肉是可疑的\n校外培训换个马甲继续割\n每一次热搜过去就没人管了' },
          { row: 3, col: 0, content: '', isRowHeader: true },
          { row: 3, col: 1, content: '校园餐食问题年年曝光年年有，到底有没有人管', color: '#FFEBEE' },
          { row: 3, col: 2, content: '我当年在学校食堂吃出过创可贴，食堂阿姨说那是"加料"' },
          { row: 4, col: 0, content: '', isRowHeader: true },
          { row: 4, col: 1, content: '校外培训又是那几家换个马甲继续割', color: '#E3F2FD' },
          { row: 4, col: 2, content: '"双减"减了个寂寞，地下补习班一节课比之前还贵，家长更焦虑了' },
          { row: 5, col: 0, content: '', isRowHeader: true },
          { row: 5, col: 1, content: '每次热搜过去就没人管了，这才是最可悲的', color: '#FFEBEE' },
          { row: 5, col: 2, content: '等下一个明星塌房，这些事就又没人记得了，互联网金鱼记忆' },
          { row: 6, col: 0, content: '', isRowHeader: true },
          { row: 6, col: 1, content: '🟢 建议：建立校园食安独立监督机制', color: '#E8F5E9', isConsensus: true },
          { row: 6, col: 2, content: '让家长委员会参与食堂抽检，别让学校自己查自己，那能查出啥' },
        ],
      },
      {
        id: 's2',
        name: '证据区',
        cells: [
          { row: 1, col: 0, content: '', isRowHeader: true },
          { row: 1, col: 1, content: '📎 各地校园食品安全问题汇总表' },
          { row: 2, col: 0, content: '', isRowHeader: true },
          { row: 2, col: 1, content: '📎 涉事学校/机构名单' },
          { row: 3, col: 0, content: '', isRowHeader: true },
          { row: 3, col: 1, content: '📎 教育部近年相关文件梳理' },
        ],
      },
    ],
  },
}
