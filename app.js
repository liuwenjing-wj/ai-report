const CAT_COLORS = {
'AI基础与模型':'#60a5fa','NLP与大模型':'#a78bfa','机器学习与优化':'#fb923c',
'供应链应用':'#34d399','数据工程':'#fbbf24','系统架构':'#f472b6',
'前沿技术':'#c084fc','产品方法论':'#67e8f9'
};

let newIdSet = new Set();

const nodes = [
{id:'hallucination',name:'AI幻觉',cat:'AI基础与模型',desc:'大模型有时会一本正经地生成完全错误的内容，就像一个自信满满的实习生编造数据——他自己不觉得有问题，但信息是假的。在物流场景中，AI可能推荐一个不存在的库位、编造不存在的供应商交期，而用户看到AI输出往往会默认信任。',pm:'产品层面要加两道防线：一是让系统自动校验AI推荐的库位/SKU是否真实存在，二是关键操作（如补货、调拨）必须有人工确认步骤。AI只给建议，决策权留给人。'},
{id:'classify_regress',name:'分类 vs 回归',cat:'AI基础与模型',desc:'分类和回归是AI的两种基本任务类型。分类是判断"是什么"——比如这个订单是否异常、这个包裹是否破损，输出是类别标签。回归是预测"多少"——比如配送需要几天、库存还剩多少件，输出是数值。',pm:'搞混任务类型会导致选错模型和评估指标。在TMS中预测配送时效是回归任务，如果你跟算法同学说"帮我做个分类"，方向就错了。记住这个判断口诀：判断类别用分类，预测数值用回归。'},
{id:'ocr',name:'OCR 单据识别',cat:'AI基础与模型',desc:'OCR（光学字符识别）让AI能从图片中"读出"文字。在物流中每天要处理大量纸质单据——运单、报关单、发票、装箱单，传统做法是人工逐字段录入系统，费时且容易出错。OCR可以自动识别图片中的文字，但通用OCR只能"读出所有字"，还得自己从一堆文字中提取"运单号""寄件人"等关键字段。',pm:'更好的方案是用专门训练的物流单据OCR（也叫IDP），直接输出结构化字段。评估时关注字段级准确率（不是整体准确率），因为运单号错一个字整单就废了。'},
{id:'function_calling',name:'Function Calling',cat:'AI基础与模型',desc:'Function Calling让AI从"能说"升级为"能做"。传统AI只能生成文字回复，而有了Function Calling，AI在对话过程中可以主动调用外部函数或API。比如用户在WMS中问"三号仓A类商品还有多少库存"，AI不只是回答"您可以去系统查一下"，而是直接调用库存查询接口获取实时数据，再用自然语言告诉你"三号仓A类商品当前库存1,250件，低于安全库存"。',pm:'在物流系统中，可以为AI配置一组Function（查库存、查订单、查物流、创建工单等），让AI从问答机器人变成真正能干活的助手。注意权限控制——哪些接口AI可以自动调用、哪些需要人工确认。'},
{id:'fewshot',name:'Few-shot Learning',cat:'AI基础与模型',desc:'Few-shot Learning让模型只看几个示例就能学会新任务，不用从零标注大量数据。类比：你给新来的拣货员看了3种包裹的打包方式，他就学会了——不用培训几百种。在物流中，异常类型很多、每种标注成本高，Few-shot可以用最少的样本快速覆盖长尾场景。',pm:'上线前只需准备每个类别3-5个高质量示例放进prompt里。Few-shot的效果很依赖示例质量——选最有代表性的案例，不要随便挑。'},
{id:'token',name:'Token',cat:'AI基础与模型',desc:'Token是大模型处理文本的最小单位，可以理解为AI的"阅读颗粒"。一个中文字大约1-2个Token，一个英文单词大约1个Token。Token数量直接决定API调用成本和响应速度——用得越多越贵、越慢。',pm:'物流系统处理大量单据文本时，一次查询可能消耗几千Token，按量计费时成本不低。设计AI功能时需要考虑Token预算：只发送必要字段、限制上下文轮数、长文本先做摘要再喂给模型。'},
{id:'generative_ai',name:'生成式AI',cat:'AI基础与模型',desc:'生成式AI是能"创造"新内容的AI，区别于只做分类或检索的传统AI。传统AI做的是选择题（这个订单是不是异常？），生成式AI做的是问答题（帮我写一份异常分析报告）。在物流中，生成式AI可以自动撰写异常分析报告、生成拣货指令、草拟补货建议、甚至规划路线方案。',pm:'各种"智能助手""自动报告""智能建议"类功能的技术底座都是生成式AI。但输出质量高度依赖prompt设计——同样的需求，换一种描述方式，输出质量可能差一个档次。'},
{id:'mcp',name:'MCP协议',cat:'系统架构',desc:'MCP（Model Context Protocol）是让AI模型标准化调用外部工具和读取数据的协议，类似于AI世界的"USB接口标准"。没有MCP之前，每个AI对接外部系统都要写专门的集成代码；有了MCP，AI可以用统一的方式查WMS库存、调TMS路径规划、读OMS订单。',pm:'MCP的价值在于降低集成成本——以前对接一个系统要开发一周，现在可能一天就搞定。但MCP还在早期阶段，各厂商实现有差异，接入前需要验证稳定性。'},
{id:'semantic_search',name:'语义搜索',cat:'NLP与大模型',desc:'传统关键词搜索只能匹配文字，搜"包裹破损"找不到写了"货物损毁"的工单。语义搜索基于含义匹配，能理解"包裹破损"和"货物损毁"说的是同一件事。在物流的知识库、工单检索、智能客服中，语义搜索大幅提升搜索体验。',pm:'不过语义搜索需要嵌入模型（Embedding Model）支持，计算成本比关键词搜索高，实际产品中通常是混合方案——关键词搜索兜底+语义搜索增强。'},
{id:'context_window',name:'上下文窗口',cat:'NLP与大模型',desc:'上下文窗口是AI一次能处理的信息量上限，类比工作台的大小——桌子越大能同时摊开的文件越多。窗口小的模型只能看最近的几轮对话，窗口大的模型可以同时参考几十页的业务文档。',pm:'处理复杂的物流业务逻辑时（比如分析某品类在5个仓库的库存周转情况），可能需要大窗口模型或分段处理策略。超出窗口的信息AI会"忘记"，导致回答不完整。选模型时关注窗口大小是否匹配你的业务数据量。'},
{id:'hitl',name:'人机回环',cat:'产品方法论',desc:'人机回环是一种工作模式：AI做初步筛选和判断，关键决策交给人类确认，形成"AI→人→AI"的循环。在物流异常处理中，AI从10000个订单中标记出100个可疑订单，人工只需确认这100个，而不是审查全部10000个。',pm:'既保证效率（AI处理99%的初筛），又保证准确性（关键决策由人把关）。设计产品时关键是定好阈值——AI标太多人忙不过来，标太少会漏问题。阈值要可调，让业务方根据实际效果微调。'},
{id:'prf1',name:'准确率/召回率/F1',cat:'产品方法论',desc:'评估分类模型的三把尺子。准确率：AI说"这个订单异常"，有多少次说对了（查准）。召回率：所有真异常的订单，AI找出了多少（查全）。F1是准确率和召回率的调和平均值。',pm:'在物流异常检测中，漏掉一个异常订单可能导致客户投诉（召回率低），多查几个正常订单只是多花人工复核时间（准确率低）。通常漏检代价远高于误报，所以优先保证召回率。算法同学汇报指标时，别只看一个数字，要拆开看。'},
{id:'transformer',name:'Transformer',cat:'NLP与大模型',desc:'Transformer是当前所有主流AI模型的底层架构，2017年由Google提出。它的核心创新是注意力机制——让模型同时关注输入的所有部分，自动判断哪些信息更重要。比如理解"三号仓A类商品因促销导致库存下降"时，模型能同时关联仓库、商品类别、原因，而不是逐字处理。',pm:'这种全局理解能力特别适合复杂的业务逻辑。作为PM不需要深入技术细节，但知道"基于Transformer"意味着模型有强大的上下文理解能力就够了。'},
{id:'demand_forecast',name:'需求预测',cat:'供应链应用',desc:'需求预测是供应链AI中最成熟、落地最多的方向。核心是用历史销售数据、季节性规律、促销计划、天气因素等信息让AI预测未来一段时间的需求量。预测准了，补货更精准、库存周转更快、缺货率更低；预测偏了，要么库存积压占资金，要么断货丢销售。',pm:'需求预测还驱动人力排班、仓储容量规划和运力预备。关键是设计持续优化机制——接入实际销量做反馈、支持人工修正预测值、按品类和仓库维度分别评估偏差。'},
{id:'knowledge_graph',name:'知识图谱',cat:'NLP与大模型',desc:'知识图谱用节点和关系来结构化表示知识，把零散信息组织成一张可推理的网络。在物流中，可以表示"供应商A→提供→原材料B→用于→商品C→存储于→仓库D→发往→客户E"这样的复杂关系。',pm:'当AI要回答"供应商A延误会波及哪些客户订单"时，知识图谱让它能沿着关系链自动追溯。PM需要关注的是数据治理——实体和关系的定义要准确，这是知识图谱的基础。'},
{id:'llm',name:'大语言模型 LLM',cat:'NLP与大模型',desc:'大语言模型是基于Transformer架构、用海量文本预训练的超大模型，参数从几十亿到上万亿。核心能力是理解和生成自然语言——给它一段业务描述，它能帮你分析、总结、翻译、生成新内容。在物流中LLM的应用场景非常广：智能客服理解客户投诉意图、需求分析从会议纪要提取关键信息、PRD撰写、异常诊断等。',pm:'LLM不是万能的，精确数值计算、实时数据查询这些任务它不擅长，应该交给专门的系统。'},
{id:'rl',name:'强化学习',cat:'机器学习与优化',desc:'强化学习让AI（Agent）在环境中不断试错，根据奖励信号调整策略。类比训练宠物——做对了给奖励，做错了不给，反复练习学会最优行为。在物流中最典型的应用是仓库AGV路径规划和配送路线优化：AGV不断尝试不同路线，走得快给奖励、碰撞扣分，逐渐学会最优路径。',pm:'RL训练需要大量模拟数据和计算资源，冷启动阶段效果可能不如规则系统。建议先用规则兜底，积累数据后再逐步引入RL。'},
{id:'cv',name:'计算机视觉',cat:'AI基础与模型',desc:'计算机视觉让机器从图像和视频中提取有意义的信息。在物流中，CV的应用远不止扫码：包裹自动分拣（识别形状和标签）、货损检测（识别破损变形渗漏）、车牌识别（进出场自动登记）、叉车行为监控（是否违规操作）。一个好的CV模型能把质检人员从每天几千次目检中解放出来。',pm:'CV模型对训练数据的分布非常敏感——仓库A训练的模型在仓库B可能效果大打折扣，因为光照、包裹外观都不同。上线后要持续收集误判案例迭代模型。'},
{id:'slm',name:'小语言模型 SLM',cat:'NLP与大模型',desc:'小语言模型和大语言模型的区别主要在参数量：SLM通常1B-7B参数，LLM动辄70B以上。SLM的好处是推理速度快、部署成本低、可以跑在手机或边缘设备上。在物流现场设备上（扫码枪、叉车终端），跑一个70B大模型不现实，但7B的SLM可以实时运行。',pm:'简单的分类和信息提取任务，微调后的SLM效果接近大模型但成本只有1/10。选型的判断标准：任务简单用SLM，任务复杂用LLM，不确定就先试SLM。'},
{id:'idp',name:'智能文档处理 IDP',cat:'供应链应用',desc:'IDP比传统OCR更进一步——不只是识别文字，还能理解文档结构并提取有意义的字段。在物流中，每天处理大量运单、报关单、发票、装箱单，这些文档格式不统一、有盖章遮挡、有手写补充，人工录入费时费力。IDP能自动识别文档类型、定位关键字段、提取并校验信息，把人工录入从小时级缩短到分钟级。',pm:'IDP准确率通常在90-95%之间，剩余5-10%仍需人工复核。选型重点看对自家单据格式的适配能力，最好选支持持续学习的模型。'},
{id:'ab_test',name:'A/B测试',cat:'产品方法论',desc:'A/B测试是同时跑两个方案让数据来判断谁更好。在物流AI功能验证中特别有用——比如上线AI库位推荐功能，A组用新AI推荐，B组用现有规则推荐，跑两周对比拣货效率、差错率。',pm:'注意：A/B测试要确保两组样本有可比性（不能把最忙的仓库全放A组），要跑够时间（至少两周排除日常波动）。不要只跑三天就下结论。'},
{id:'data_flywheel',name:'数据飞轮',cat:'数据工程',desc:'数据飞轮是"越用越好"的正循环机制：用户使用AI功能→产生更多数据→用数据改进模型→模型变好→体验提升→更多使用→更多数据。在WMS中，AI库位推荐功能用的人越多，系统积累的数据越多，推荐越准，形成竞争壁垒。',pm:'设计产品时要主动构建飞轮——把用户反馈（人工修正的推荐结果）回流到训练数据中。飞轮需要时间积累，上线初期效果一般很正常。'},
{id:'distillation',name:'模型蒸馏',cat:'机器学习与优化',desc:'模型蒸馏是把大模型的"知识"迁移到小模型中，让小模型在保持接近效果的同时推理速度快很多倍、成本低很多倍。在物流中特别适合边缘场景——比如叉车上的摄像头需要实时判断货架是否有空位，用70B大模型实时处理不现实，但蒸馏后的7B小模型可以跑在边缘设备上流畅运行。',pm:'评估蒸馏模型时不能只看平均准确率，还要看在"长尾场景"上的表现——大模型擅长的罕见case，蒸馏后的小模型可能丢失了。'},
{id:'predictive_maint',name:'预测性维护',cat:'供应链应用',desc:'预测性维护用AI分析设备数据（振动、温度、电流、运行时长），在故障发生前预判问题，安排预防性维护。对自动化仓库特别重要——分拣机或输送带一停，整个仓库瘫痪。传统维护是"坏了再修"，预测性维护是"快坏了提前修"。',pm:'ROI很高（一次停机损失可能几十万以上），但需要传感器和数据采集系统的前期投入。评估时关注"提前预警时间"——提前2小时和提前2天价值完全不同。'},
{id:'edge_ai',name:'边缘AI',cat:'系统架构',desc:'边缘AI把AI模型部署在离数据最近的本地设备上，不依赖云端。在物流现场特别有价值：网络不稳定（仓库深处信号差）、实时性要求高（叉车控制不能等云端返回）、数据敏感（客户地址不想上传云端）。',pm:'主要挑战是设备算力有限，通常需要配合模型量化和蒸馏把大模型压缩到能跑的大小。选型时先确认设备算力，再决定能部署多大的模型。'},
{id:'synthetic_data',name:'合成数据',cat:'数据工程',desc:'合成数据是AI生成的"假"数据，用于解决训练数据不足的问题。在物流异常检测中，某种异常一年只发生几次，样本太少模型学不会。可以用合成数据扩充训练集，生成类似但不完全一样的异常样本，提升模型对罕见异常的识别能力。',pm:'合成数据质量很关键，需要在合成数据训练的模型和真实数据训练的模型之间做对比验证，确保合成数据没引入偏差。'},
{id:'llm_eval',name:'大模型评估',cat:'产品方法论',desc:'评估大模型不能只看一个维度。准确率只是其中之一，还要看推理速度（影响用户体验）、调用成本（影响ROI）、安全性（是否输出有害内容）、一致性（同样的问题多次问是否给出一致答案）。',pm:'根据业务场景建立自己的评估框架：物流智能客服重点评估多轮对话能力和业务知识准确率，PRD助手重点看长文本生成质量。不要被厂商的通用榜单排名忽悠，要用真实业务数据做测试。'},
{id:'copilot',name:'AI Copilot',cat:'系统架构',desc:'Copilot是"智能助手"模式——辅助人决策而非替代人。和全自动化的区别：Copilot给建议，人来拍板。在物流中，给拣货员推荐最优路径但拣货员可以选择跳过，给计划员建议补货方案但计划员可以修改后确认。',pm:'这种模式更容易被一线员工接受（不是来抢饭碗的），也更容易上线。注意Copilot不能变成"强制建议"——如果系统总是要求员工确认AI推荐，反而拖慢效率。一定要给员工跳过的选项。'},
{id:'process_mining',name:'流程挖掘',cat:'系统架构',desc:'流程挖掘从系统日志中自动还原实际业务流程。在WMS中，每个操作（扫码、拣货、打包、交接）都有时间戳和操作人信息，流程挖掘能自动分析出真实的拣货路径是什么、是否有绕行和重复、和SOP差异多大。',pm:'结合AI可以自动定位瓶颈并建议优化方案。数据质量是关键——如果日志不完整或时间戳不准，分析结果会失真。先确保日志足够完整。'},
{id:'federated',name:'联邦学习',cat:'机器学习与优化',desc:'联邦学习让多个参与方在不共享原始数据的情况下联合训练模型。每个参与方用自己的数据在本地训练，只把模型参数（不是原始数据）上传聚合。在物流中，不同仓库或客户的库存数据往往涉及商业敏感不愿共享，联邦学习让它们可以联合训练更准确的预测模型。',pm:'前提是需要足够多的参与方（通常5个以上）才能发挥效果。关注数据异构性——不同仓库的商品结构差异大时，全局模型可能对某些仓库效果差。'},
{id:'reasoning_model',name:'推理模型',cat:'NLP与大模型',desc:'推理模型和普通大模型的区别在于"思考方式"：普通模型直接给答案，推理模型会先列步骤、逐步推导再得出结论。类比：普通模型像抢答选手脱口而出，推理模型像学霸先列草稿再写答案。',pm:'在复杂物流规划中（多仓多车型路径优化、异常根因分析），推理模型更可靠更可解释——你能看到它的推理过程，判断逻辑对不对。但推理模型的推理过程会增加Token消耗和响应延迟。'},
{id:'or',name:'运筹优化 OR',cat:'机器学习与优化',desc:'运筹优化用数学方法在约束条件下寻找最优解，是物流领域最经典的优化技术。车辆路径规划、仓库选址、订单分配、人员排班都是OR的经典问题。传统OR方法在简单场景下能快速给出精确最优解，但当问题复杂度上升（多仓多车型带时间窗考虑实时路况），计算时间爆炸。',pm:'结合AI可以处理更复杂的约束和动态变化。实际项目中通常是OR给基础方案+AI做实时微调，兼顾解的质量和响应速度。'},
{id:'anomaly_detect',name:'异常检测',cat:'供应链应用',desc:'异常检测从数据中识别偏离正常模式的异常点，核心价值是"帮你提前发现问题而不是事后复盘"。在物流中可以检测：异常订单（金额/数量/地址异常）、配送延误（某路线时效突然变长）、库存波动（某SKU库存异常下降）、设备异常（振动频率突变）。',pm:'关键是定义好"正常"的基准（不同仓库、不同季节、不同品类的"正常"不一样），以及异常程度的评分而不只是"异常/正常"的二元判断，让用户知道优先处理哪个。'},
{id:'multi_agent',name:'多智能体系统',cat:'前沿技术',desc:'多智能体系统让多个专业化的AI Agent分工协作。在物流调度中，订单Agent处理订单优先级、库存Agent管理库存分配、排产Agent规划拣货顺序、调度Agent安排车辆和人员，各自负责各自擅长的事，通过消息通信协调。',pm:'单个大模型很难同时处理好跨环节的复杂任务，多Agent分工更接近现实中各岗位分工的模式。设计难点在于Agent之间的通信协议和冲突解决机制。'},
{id:'asr',name:'ASR 语音拣货',cat:'供应链应用',desc:'ASR（语音识别）在仓储中的应用是用语音指令替代手持PDA的操作流程。拣货员通过说话查询库位、确认数量、报告完成，双手完全解放。特别适合搬运大件商品（双手搬货无法操作PDA）和冷库作业（戴厚手套无法触屏）。',pm:'语音识别准确率通常95%左右，关键操作（数量确认）建议配合条码扫描二次校验。ROI优先在大件区/冷库区部署。'},
{id:'causal',name:'因果推断',cat:'产品方法论',desc:'相关性告诉你"A和B经常一起发生"，因果推断告诉你"A导致了B"。做业务决策时这个区别至关重要——比如发现"配送准时率下降"，相关性分析告诉你"仓库A的效率在下降"，但因果推断能帮你找到真正原因：是最近换了分拣系统还是仓库A最近承接了更多复杂订单。',pm:'找到真正原因才能对症下策。做数据分析时不要满足于相关性，多问"为什么"，用控制变量法和A/B测试验证因果关系。'},
{id:'graphrag',name:'GraphRAG',cat:'前沿技术',desc:'GraphRAG解决了普通RAG的一个关键短板。普通RAG只在文档库中搜索文本片段，遇到"某供应商延误会波及哪些客户订单"这类涉及多跳关系的问题时无能为力——因为这种信息不存在于任何单个文档中，而是分散在多个系统的关系链中。GraphRAG把知识图谱的图结构引入检索，能沿着关系链做多跳推理。',pm:'前提是知识图谱的数据要建设好——如果供应商-物料-产品的关系数据不完整，GraphRAG效果也会差。建议先做数据治理再升级。'},
{id:'agent_orch',name:'Agent编排',cat:'前沿技术',desc:'Agent编排是管理多个AI Agent和工具协调工作的"脚手架"，定义任务如何分配、执行顺序、Agent之间怎么通信、出错怎么处理、结果怎么汇总。类比交响乐团指挥——每个乐手（Agent）各有所长，但需要指挥（编排）协调节奏和配合。',pm:'在物流中，多个Agent协作处理订单→库存→排产→调度，没有编排就只能靠点对点通信，一旦某个Agent故障整个系统就乱。编排的设计质量直接决定系统的可靠性和扩展性。'},
{id:'quantization',name:'模型量化',cat:'机器学习与优化',desc:'模型量化降低模型参数的精度来压缩模型——比如从32位浮点数降到4位整数。效果是模型体积缩小4-8倍、推理速度快2-4倍、硬件要求大幅降低。70B的大模型量化后可能跑在单张消费级显卡上。',pm:'对于需要私有化部署的物流AI（企业不想把数据送云端），量化是平衡效果和成本的关键。但精度下降可能影响效果，需要评估量化后在关键任务上的表现是否可接受。'},
{id:'control_tower',name:'AI控制塔',cat:'供应链应用',desc:'AI控制塔是供应链的"全局驾驶舱"——汇聚采购、库存、生产、物流、销售各环节的实时数据，通过AI分析提供全局可视化、智能预警和决策建议。让管理者一眼看清从采购到末端配送的全链路状态：哪个仓库快爆仓了、哪条运输线路在延误、哪个供应商交期不稳定。',pm:'控制塔是最顶层的产品形态，难点不在AI而在数据打通——各系统数据格式不统一、更新频率不同、口径不一致，需要大量ETL工作。'},
{id:'simulation',name:'仿真优化',cat:'供应链应用',desc:'仿真优化通过建立数字孪生模型在虚拟环境中模拟不同运营方案的效果，先在电脑里跑一遍验证再决定要不要在现实中实施。比如改造分拣线前，用仿真模型模拟新布局在不同订单量下的吞吐量，选出最优方案再动工。',pm:'大幅降低试错成本——仿真跑一次几小时+几千元计算费用，现实中改造失败要停工数周+损失几十万。关键是仿真模型要用真实历史数据校准。'},
{id:'model_select',name:'大模型 vs 小模型选型',cat:'产品方法论',desc:'大模型通用能力强但成本高、延迟大，小模型专用性强、部署轻、响应快。物流中的实际需求大多是分类、预测、信息提取等"不那么复杂"的任务，微调过的小模型完全能搞定，用大模型是杀鸡用牛刀。',pm:'只有需要复杂推理、自然语言理解、内容生成的场景才需要大模型。选型顺序：先看任务复杂度和数据量，再看延迟和成本约束，最后才决定用哪个模型，不要上来就用最大的。'},
{id:'agentic_rag',name:'Agentic RAG',cat:'前沿技术',desc:'传统RAG像一个查资料助手：你问一个问题，它搜一遍文档返回结果，一次到位。Agentic RAG更像一个智能研究员——它能自己判断什么时候需要查资料、查什么关键词、查到的结果够不够、要不要换个角度再查、甚至同时查多个系统交叉验证。',pm:'设计知识库问答产品时，应允许AI多轮检索（不只查一次），同时也要设检索次数上限防止成本失控。对于需要跨系统整合信息的问题（如"这个月拣货效率为什么下降"），Agentic RAG能先查效率指标→发现B仓库下降最明显→查B仓库排班和订单结构→给出综合结论。'},
{id:'time_series',name:'时序基础模型',cat:'前沿技术',desc:'时序基础模型是针对时间序列数据预训练的通用模型，已经学会了"趋势、周期性、节假日效应、突变点"等常见模式，拿来就能做预测，不需要从头训练。在物流中，订单量、库存水位、运输时效等数据都有很强的时间规律，特别适合。',pm:'相比传统ARIMA，能自动捕捉更复杂的模式；相比定制深度学习，不需要大量标注数据和开发周期。开发效率高得多，特别适合需要快速上线或同时预测多个品类的场景。'},
{id:'guardrail',name:'AI输出护栏',cat:'系统架构',desc:'AI输出护栏是在AI输出和用户之间加的安全检查层，确保AI的输出安全、可靠、合规。就像高速公路的护栏——正常情况下不影响行驶，但在偏离时能拦住你。具体包括：格式校验（输出是否包含必要字段）、数值校验（补货量是否在合理范围）、业务校验（推荐的SKU是否存在）、敏感过滤（是否泄露客户地址）、操作护栏（AI只能建议不能直接执行）。',pm:'所有AI落地的产品都需要护栏。设计时宁严勿松——初期可以多拦一些（降低误操作风险），上线稳定后再逐步放宽。'}
];

const edges = [
{source:'hallucination',target:'classify_regress'},{source:'hallucination',target:'llm'},
{source:'hallucination',target:'guardrail'},{source:'classify_regress',target:'anomaly_detect'},
{source:'ocr',target:'idp'},{source:'ocr',target:'cv'},{source:'cv',target:'edge_ai'},
{source:'function_calling',target:'mcp'},{source:'fewshot',target:'llm'},
{source:'token',target:'context_window'},{source:'token',target:'quantization'},
{source:'generative_ai',target:'llm'},{source:'generative_ai',target:'copilot'},
{source:'transformer',target:'llm'},{source:'transformer',target:'context_window'},
{source:'transformer',target:'reasoning_model'},{source:'llm',target:'slm'},
{source:'llm',target:'reasoning_model'},{source:'llm',target:'llm_eval'},
{source:'llm',target:'context_window'},{source:'semantic_search',target:'graphrag'},
{source:'semantic_search',target:'knowledge_graph'},{source:'knowledge_graph',target:'graphrag'},
{source:'rl',target:'multi_agent'},{source:'rl',target:'or'},
{source:'distillation',target:'slm'},{source:'distillation',target:'edge_ai'},
{source:'distillation',target:'quantization'},{source:'quantization',target:'edge_ai'},
{source:'federated',target:'data_flywheel'},{source:'federated',target:'edge_ai'},
{source:'demand_forecast',target:'time_series'},{source:'demand_forecast',target:'simulation'},
{source:'predictive_maint',target:'edge_ai'},{source:'predictive_maint',target:'anomaly_detect'},
{source:'anomaly_detect',target:'data_flywheel'},{source:'control_tower',target:'simulation'},
{source:'control_tower',target:'process_mining'},{source:'asr',target:'edge_ai'},
{source:'or',target:'simulation'},{source:'idp',target:'llm'},
{source:'copilot',target:'function_calling'},{source:'copilot',target:'hitl'},
{source:'mcp',target:'agent_orch'},{source:'process_mining',target:'hitl'},
{source:'guardrail',target:'agent_orch'},{source:'guardrail',target:'copilot'},
{source:'graphrag',target:'agent_orch'},{source:'agentic_rag',target:'agent_orch'},
{source:'agentic_rag',target:'graphrag'},{source:'multi_agent',target:'agent_orch'},
{source:'time_series',target:'simulation'},
{source:'hitl',target:'llm_eval'},{source:'ab_test',target:'llm_eval'},
{source:'causal',target:'ab_test'},{source:'model_select',target:'llm_eval'},
{source:'model_select',target:'slm'}
];

const exercises = [
{date:'7/1',type:'概念辨析题',diff:'入门',scene:'你的WMS系统想引入AI来自动识别运单信息。目前有两个方案：A.用通用OCR引擎识别所有文字再提取关键字段；B.用专门训练的IDP系统端到端处理。',question:'从准确率和维护成本两个角度，你会怎么评估这两个方案？',answer:'方案A通用OCR引擎前期成本低，但对物流单据的特殊格式识别率低，后续需要大量规则提取关键字段，维护成本高。方案B专用IDP系统针对物流单据训练，字段级准确率更高（95%+），且可持续学习新格式。建议先用A做MVP验证可行性，日均处理量超过500单时切换到B。'},
{date:'7/6',type:'概念辨析题',diff:'入门',scene:'你在评估一个异常订单检测模型，算法同学给了两组指标：模型A准确率95%、召回率60%；模型B准确率80%、召回率90%。',question:'作为WMS的PM，你会选哪个模型？为什么？',answer:'选模型B。异常订单检测的核心风险是"漏检"——漏掉的异常订单可能导致客户投诉甚至安全事故。模型B召回率90%能发现90%的异常，虽然准确率80%会多检查一些正常订单，但比漏掉40%异常的模型A风险更可控。核心原则：宁可误报不可漏报。'},
{date:'7/10',type:'概念辨析题',diff:'入门',scene:'你的自动化仓库有两项AI改进计划：A.引入数据飞轮持续优化分拣效率；B.引入预测性维护减少设备停机。预算只够先做一项。',question:'你会先推哪个？判断依据是什么？',answer:'先推B预测性维护。理由：1）收益可量化且见效快，容易拿到持续预算；2）数据飞轮需要较长时间积累，属于长期投资；3）设备停机是"硬伤"（完全停工），分拣效率是"软优化"。先用B证明AI价值，再推动A。'},
{date:'7/17',type:'概念辨析题',diff:'进阶',scene:'你的团队在做一个供应链知识库问答系统。目前用的RAG方案对简单问题效果不错，但遇到"某供应商延误会波及哪些客户订单"这类问题时效果很差。有同学建议升级为GraphRAG。',question:'GraphRAG能解决这类问题的核心原因是什么？你会建议现在就升级吗？',answer:'核心原因：普通RAG只检索文本片段，无法理解"供应商→物料→产品→客户订单"这种链式关系。GraphRAG利用知识图谱做关系推理。建议：不急着升级。先把知识图谱的数据建设好，这是GraphRAG的前提。当前可折中：简单问题用普通RAG，复杂关系型问题走专门的图查询接口。'},
{date:'7/2',type:'场景应用题',diff:'入门',scene:'你的WMS系统要上线一个智能问答功能，让仓库主管可以用自然语言查询库存信息，比如"A类商品在三号仓还有多少"。',question:'基于Function Calling的概念，你会如何设计这个功能的架构？',answer:'核心思路：让大模型理解用户意图后调用对应API。1）定义Function：query_inventory(仓库, 商品类别)等；2）用户提问时模型判断意图并生成调用参数；3）系统执行查询返回结果；4）模型转化为自然语言回答。关键设计点：参数校验（防止传入不存在的仓库编号）和权限控制。'},
{date:'7/3',type:'场景应用题',diff:'入门',scene:'你的OMS系统要对接三家不同的物流服务商（顺丰、京东、中通），每家的API格式都不一样。算法同学说可以用MCP来统一管理。',question:'MCP在这个场景下具体解决什么问题？作为PM你需要关注哪些风险？',answer:'MCP解决的问题：把三家不同格式的API封装成标准化工具调用接口。风险关注：1）数据映射准确性——不同服务商状态码含义可能不同；2）容错设计——某一家API挂了不能影响其他；3）性能——多一层抽象会增加延迟。'},
{date:'7/7',type:'场景应用题',diff:'入门',scene:'你的TMS系统要优化配送路线。目前靠调度员经验排线，新人上手慢、旺季排线质量下降。你想引入知识图谱+AI来辅助。',question:'你会怎么定义知识图谱中的节点和关系？AI在其中的角色是什么？',answer:'节点类型：客户、地址、车辆、司机、时段、货物类型。关系：客户A→位于→地址X、车辆V→容量→5吨、司机D→熟悉→区域Y。AI基于图谱做推理——"这个客户在限行区域+当前时段限行+只有小车可用→建议延迟2小时或换熟悉替代路线的司机"。'},
{date:'7/8',type:'场景应用题',diff:'入门',scene:'你的仓库要上线AI视觉质检，用计算机视觉检测包裹是否破损。算法同学给了一个准确率92%的模型。',question:'92%准确率在仓储质检场景下够用吗？你会怎么设计上线方案？',answer:'92%意味着每100个包裹有8个误判，直接上线不可接受。建议：1）AI做初筛，"疑似破损"分流到人工复检；2）设置置信度阈值——高置信自动处理，中间地带人工复核；3）用人工复核结果作为反馈数据持续训练（数据飞轮）。初期人工复核比例30-40%，随模型优化逐步降低。'},
{date:'7/9',type:'场景应用题',diff:'入门',scene:'你的仓库在考虑引入语音拣货系统（ASR）替代现有的手持PDA扫描拣货。',question:'语音拣货适合什么场景？你会关注哪些指标来判断是否值得投入？',answer:'适合场景：大件商品、冷库、高频次拣货。关注指标：1）拣货效率提升（每小时件数）；2）差错率变化（语音识别约95%，需配合条码复核）；3）员工接受度；4）投入产出比。建议先在冷库场景试点，ROI最清晰。'},
{date:'7/13',type:'场景应用题',diff:'入门',scene:'你的TMS要引入AI来优化最后一公里配送路线。算法同学建议用强化学习。',question:'强化学习在这个场景下是怎么"学习"的？你需要提供什么数据？',answer:'RL在模拟环境中不断尝试不同路线，根据奖励信号优化策略。需提供：1）历史配送数据作为训练基础；2）奖励函数定义（准时+1分，迟到-5分）；3）约束条件（车辆容量、工时上限）。冷启动阶段先用规则兜底，积累数据后再切换RL。'},
{date:'7/15',type:'场景应用题',diff:'入门',scene:'你有多个仓库，想联合训练需求预测模型，但各仓库不愿意共享详细订单数据。',question:'联邦学习如何解决这个矛盾？作为PM你需要关注什么？',answer:'每个仓库用本地数据训练，只上传模型参数到中央聚合，数据不出本地。PM关注：1）通信开销；2）数据异构性——不同仓库商品结构差异大时全局模型可能对某些仓库效果差；3）参与方数量——通常5个以上效果才明显。'},
{date:'7/16',type:'场景应用题',diff:'入门',scene:'你的仓储系统要处理紧急插单，目前靠人工协调各环节响应要2小时。你想引入多智能体系统。',question:'你会怎么设计Agent的分工？',answer:'订单Agent评估影响、库存Agent检查物料、排产Agent重新规划、调度Agent调整车辆人员。协作流程：订单Agent先评估→并行通知其他Agent→各自给出调整方案→协调Agent汇总→人工确认后执行。目标：2小时响应缩短到15分钟。'},
{date:'7/14',type:'PRD翻译题',diff:'入门',scene:'你的团队要上线一个AI Copilot功能，帮助仓库主管做每日拣货任务分配。',question:'请把这个需求翻译成一条User Story和对应的Acceptance Criteria。',answer:'User Story：作为仓库主管，我希望在每日早会前收到AI生成的拣货任务分配建议，以便快速做出排班决策。\n\nAC：1）系统在每日8:00前生成建议，含按区域划分的任务量、推荐人员分配、预计完成时间；2）展示置信度，低置信标注"建议人工复核"；3）主管可一键采纳或手动调整；4）调整记录作为反馈数据；5）生成失败时降级显示昨日对比分析。'},
{date:'7/20',type:'决策判断题',diff:'进阶',scene:'你的仓库要改造分拣线布局。方案A：直接用算法基于历史数据给出最优布局，投入50万。方案B：先建数字孪生模型模拟30天验证效果再实施，投入80万。',question:'你会选哪个方案？为什么？',answer:'选方案B。理由：1）分拣线改造不可逆，仿真验证大幅降低风险；2）历史数据可能无法覆盖异常场景，仿真可模拟极端情况；3）80万看似贵，但比方案A失败后返工的150万+停工损失，30万增量成本值得。建议用B仿真2-3个候选布局，选最优再实施。'},
{date:'7/21',type:'场景应用题',diff:'进阶',scene:'你的WMS系统要接入大模型生成每日补货建议。安全团队要求必须有输出护栏。',question:'你会设计哪些具体的护栏规则？',answer:'1）格式校验——确保输出包含SKU编号、建议数量等结构化字段；2）数值校验——补货数量不超过库位容量、不能为负；3）业务校验——SKU是否存在于商品库；4）敏感信息过滤——不能包含供应商联系方式；5）操作护栏——AI只能"建议"不能"执行"，必须人工确认；6）日志审计——所有输出记录留痕。'}
];

const learningPaths = [
{id:'basics',name:'AI 基础入门',desc:'从零开始理解 AI 核心概念，建立技术直觉',color:'#60a5fa',
 nodes:['generative_ai','llm','transformer','token','context_window','slm']},
{id:'supply_chain',name:'供应链 AI 实战',desc:'掌握 AI 在物流各环节的落地场景和评估方法',color:'#34d399',
 nodes:['demand_forecast','anomaly_detect','predictive_maint','control_tower','idp','asr']},
{id:'agent',name:'智能体进阶',desc:'从单Agent到多Agent协作，理解前沿架构',color:'#c084fc',
 nodes:['function_calling','mcp','copilot','multi_agent','agent_orch','agentic_rag']},
{id:'pm',name:'产品经理 AI 工具箱',desc:'PM 必知的 AI 方法论和评估手段',color:'#67e8f9',
 nodes:['prf1','ab_test','hitl','llm_eval','causal','model_select']}
];

let scoreCorrect=0,scorePartial=0,scoreWrong=0,scoreTotal=0;
function updateScoreDisplay(){
  const el=document.getElementById('session-score');
  if(!scoreTotal){el.innerHTML='';return;}
  const pct=Math.round(((scoreCorrect+scorePartial*0.5)/scoreTotal)*100);
  el.innerHTML='本轮得分：<strong>'+pct+'%</strong>（'+scoreCorrect+' 对 / '+scorePartial+' 部分对 / '+scoreWrong+' 错，共 '+scoreTotal+' 题）';
}

// ---- Sidebar ----
document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',e=>{
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    item.classList.add('active');
    const t=document.getElementById(item.dataset.target);
    if(t)t.scrollIntoView({behavior:'smooth',block:'start'});
    document.getElementById('sidebar').classList.remove('open');
  });
});
const sectionIds=['sec-graph','sec-challenge','sec-practice','sec-news','sec-articles','sec-skills'];
window.addEventListener('scroll',()=>{
  let cur=sectionIds[0];
  for(const id of sectionIds){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<=120)cur=id;}
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.target===cur));
});

// ---- Hero ----
function parseExDate(d){const p=d.split('/');return new Date(2026,parseInt(p[0])-1,parseInt(p[1]));}
function renderHeroChallenge(){
  const sorted=[...exercises].map((e,i)=>({e,i})).sort((a,b)=>{const d=parseExDate(b.e.date)-parseExDate(a.e.date);return d!==0?d:b.i-a.i;}).map(x=>x.e);
  const ex=sorted[0];if(!ex)return;
  document.getElementById('hero-challenge').innerHTML=
    '<div class="hero-card"><div class="hero-badge"><span class="pulse"></span> 今日挑战</div>'+
    '<div class="hero-meta"><span class="hero-date">'+ex.date+'</span><span class="hero-diff '+ex.diff+'">'+ex.diff+'</span><span class="hero-type">'+ex.type+'</span></div>'+
    '<div class="hero-scene">'+ex.scene+'</div><div class="hero-q">'+ex.question+'</div>'+
    '<button class="hero-reveal" onclick="revealHeroAnswer()">查看答案</button>'+
    '<div class="hero-answer" id="hero-answer">'+ex.answer+'</div>'+
    '<div class="hero-score-row" id="hero-score-row" style="display:none"><span class="hero-score-label">自评：</span>'+
    '<button class="score-btn correct" onclick="scoreHero(1)">答对了</button>'+
    '<button class="score-btn partial" onclick="scoreHero(0.5)">部分对</button>'+
    '<button class="score-btn wrong" onclick="scoreHero(0)">答错了</button></div></div>';
}
function revealHeroAnswer(){document.getElementById('hero-answer').classList.add('show');document.querySelector('.hero-reveal').style.display='none';document.getElementById('hero-score-row').style.display='flex';}
function scoreHero(v){scoreTotal++;if(v===1)scoreCorrect++;else if(v===0.5)scorePartial++;else scoreWrong++;document.querySelectorAll('.hero-score-row .score-btn').forEach(b=>b.classList.remove('active'));if(v===1)document.querySelector('.hero-score-row .correct').classList.add('active');else if(v===0.5)document.querySelector('.hero-score-row .partial').classList.add('active');else document.querySelector('.hero-score-row .wrong').classList.add('active');updateScoreDisplay();}

// ---- News ----
function renderNews(items){document.getElementById('news-grid').innerHTML=items.map(n=>'<div class="news-card">'+(n.tags?'<div>'+n.tags.map(t=>'<span class="news-tag">'+t+'</span>').join('')+'</div>':'')+'<div class="news-title">'+n.title+'</div><div class="news-summary">'+(n.summary||'')+'</div>'+(n.source?'<div class="news-source">'+(n.sourceUrl?'<a href="'+n.sourceUrl+'" target="_blank" style="color:#a5b4fc;text-decoration:none">'+n.source+' ↗</a>':n.source)+'</div>':'')+'</div>').join('');}
function renderNewsEmpty(){document.getElementById('news-grid').innerHTML='<div class="news-empty">暂无行业热点数据，定时任务将在下次推送时同步更新</div>';}

// ---- Exercise History ----
function toggleHistory(){const b=document.getElementById('history-body'),t=document.getElementById('history-toggle'),tx=document.getElementById('history-toggle-text');const o=b.classList.toggle('show');t.classList.toggle('open',o);tx.textContent=o?'收起历史题目':'展开历史题目';}
function renderExerciseHistory(){
  const sorted=[...exercises].map((e,i)=>({e,i})).sort((a,b)=>{const d=parseExDate(b.e.date)-parseExDate(a.e.date);return d!==0?d:b.i-a.i;}).map(x=>x.e);
  const hist=sorted.slice(1);
  const types=['全部',...new Set(hist.map(e=>e.type))];
  const tabsEl=document.getElementById('history-tabs');
  let activeTab='全部';
  tabsEl.innerHTML='';
  types.forEach(t=>{
    const c=t==='全部'?hist.length:hist.filter(e=>e.type===t).length;
    const el=document.createElement('div');el.className='history-tab'+(t==='全部'?' active':'');el.textContent=t==='全部'?'全部 ('+c+')':t+' ('+c+')';
    el.addEventListener('click',()=>{document.querySelectorAll('.history-tab').forEach(x=>x.classList.remove('active'));el.classList.add('active');activeTab=t;renderList();});
    tabsEl.appendChild(el);
  });
  document.getElementById('search-input').addEventListener('input',()=>renderList());
  function renderList(){
    const q=document.getElementById('search-input').value.trim().toLowerCase();
    const f=hist.filter(e=>activeTab==='全部'||e.type===activeTab);
    const c=document.getElementById('ex-container');
    if(!f.length){c.innerHTML='<div style="text-align:center;color:#475569;padding:20px">没有匹配的练习题</div>';return;}
    const g={};f.forEach(e=>{if(!g[e.type])g[e.type]=[];g[e.type].push(e);});
    let h='';
    Object.entries(g).forEach(([type,items])=>{
      h+='<div class="ex-group"><div class="ex-group-title">'+type+' <span class="ex-count">'+items.length+' 题</span></div>';
      items.forEach((ex,i)=>{
        const m=!q||ex.scene.toLowerCase().includes(q)||ex.question.toLowerCase().includes(q)||ex.answer.toLowerCase().includes(q);
        const uid='h_'+type+'_'+i;
        h+='<div class="ex-card'+(m?'':' hidden')+'"><div class="ex-meta"><span class="ex-date">'+ex.date+'</span><span class="ex-diff '+ex.diff+'">'+ex.diff+'</span></div><div class="ex-scene">'+ex.scene+'</div><div class="ex-q">'+ex.question+'</div><button class="ex-toggle" onclick="toggleHistAnswer(\''+uid+'\',this)">查看答案</button><div class="ex-answer" id="'+uid+'">'+ex.answer+'</div><div class="ex-score-row" id="s_'+uid+'" style="display:none"><button class="score-btn correct" onclick="scoreHist(this,1)">答对了</button><button class="score-btn partial" onclick="scoreHist(this,0.5)">部分对</button><button class="score-btn wrong" onclick="scoreHist(this,0)">答错了</button></div></div>';
      });
      h+='</div>';
    });
    c.innerHTML=h;
  }
  renderList();
}
function toggleHistAnswer(uid,btn){const a=document.getElementById(uid);a.classList.toggle('show');btn.textContent=a.classList.contains('show')?'收起答案':'查看答案';const s=document.getElementById('s_'+uid);if(s&&a.classList.contains('show'))s.style.display='flex';}
function scoreHist(btn,v){scoreTotal++;if(v===1)scoreCorrect++;else if(v===0.5)scorePartial++;else scoreWrong++;btn.parentElement.querySelectorAll('.score-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');updateScoreDisplay();}

// ---- Learning Paths ----
function renderLearningPaths(){
  const el=document.getElementById('paths-section');
  let h='<div class="path-tabs">';
  learningPaths.forEach((p,i)=>{h+='<div class="path-tab'+(i===0?' active':'')+'" data-path="'+p.id+'" style="'+(i===0?'border-color:'+p.color+'40;color:'+p.color:'')+'">'+p.name+'</div>';});
  h+='</div>';
  learningPaths.forEach((p,i)=>{
    h+='<div class="path-display'+(i===0?' active':'')+'" id="path-'+p.id+'"><div class="path-header"><h3 style="color:'+p.color+'">'+p.name+'</h3><p>'+p.desc+'（'+p.nodes.length+' 个知识点）</p></div><div class="path-nodes">';
    p.nodes.forEach((nId,j)=>{const n=nodes.find(x=>x.id===nId);h+='<div class="path-node" data-node="'+nId+'" style="border-color:'+p.color+'20"><span class="step-num" style="border-color:'+p.color+'60;color:'+p.color+'">'+(j+1)+'</span>'+(n?n.name:nId)+'</div>';if(j<p.nodes.length-1)h+='<span class="path-arrow">\u2192</span>';});
    h+='</div></div>';
  });
  el.innerHTML=h;
  // Tab click
  el.querySelectorAll('.path-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      const pid=tab.dataset.path,path=learningPaths.find(p=>p.id===pid);
      el.querySelectorAll('.path-tab').forEach(t=>{t.classList.remove('active');t.style.borderColor='';t.style.color='';});
      el.querySelectorAll('.path-display').forEach(d=>d.classList.remove('active'));
      tab.classList.add('active');tab.style.borderColor=path.color+'40';tab.style.color=path.color;
      document.getElementById('path-'+pid).classList.add('active');
    });
  });
  // Node click — delegate to graph API
  el.querySelectorAll('.path-node').forEach(pn=>{
    pn.addEventListener('click',()=>{
      const nId=pn.dataset.node;
      const n=nodes.find(x=>x.id===nId);
      if(!n||!window._graphAPI)return;
      window._graphAPI.showDetail(n);
      window._graphAPI.highlightNode(n);
      document.getElementById('sec-graph').scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
}

// ---- Incremental updates ----
(async()=>{
// ---- Welcome Popup ----
const wMsgs=['你终于来了','嘿，今天学点啥？','知识充电站营业中','每天进步一点点'];
let wIdx=0;
const wEl=document.getElementById('welcome-text');
const wTimer=setInterval(()=>{wIdx=(wIdx+1)%wMsgs.length;wEl.style.opacity='0';setTimeout(()=>{wEl.textContent=wMsgs[wIdx];wEl.style.opacity='1';},300);},3000);
function closeWelcome(){clearInterval(wTimer);const o=document.getElementById('welcome-overlay');if(o){o.style.transition='opacity 0.3s';o.style.opacity='0';setTimeout(()=>o.remove(),300);}}
const wBtn=document.getElementById('welcome-btn');if(wBtn)wBtn.addEventListener('click',closeWelcome);
const wOv=document.getElementById('welcome-overlay');if(wOv)wOv.addEventListener('click',e=>{if(e.target.id==='welcome-overlay')closeWelcome();});

try{
  const r=await fetch('updates.json?v='+Date.now());
  if(r.ok){
    const d=await r.json();
    if(d.nodes){const ids=new Set(nodes.map(n=>n.id));d.nodes.forEach(n=>{if(!ids.has(n.id)){nodes.push(n);ids.add(n.id);}});}
    if(d.newNodeIds)d.newNodeIds.forEach(id=>newIdSet.add(id));
    if(d.edges){d.edges.forEach(e=>{if(!edges.some(x=>x.source===e.source&&x.target===e.target))edges.push(e);});}
    if(d.exercises)d.exercises.forEach(e=>exercises.push(e));
    const sn=document.getElementById('stat-nodes'),se=document.getElementById('stat-exercises'),sc=document.getElementById('stat-cats');
    if(sn)sn.textContent=nodes.length;if(se)se.textContent=exercises.length;if(sc)sc.textContent=new Set(nodes.map(n=>n.cat)).size;
    if(d.lastDate){document.getElementById('sidebar-update').textContent='更新于 '+d.lastDate;}
    if(d.news&&d.news.length)renderNews(d.news);
  }
}catch(e){}
// Fallback: if sidebar still shows '--', use today's date
const suEl=document.getElementById('sidebar-update');
if(suEl&&suEl.textContent.includes('--')){const now=new Date();suEl.textContent='更新于 '+(now.getMonth()+1)+'月'+now.getDate()+'日';}

renderHeroChallenge();

// ---- News with today/yesterday toggle ----
const fallbackNews = [
{title:'OpenAI 发布 GPT-5.6：旗舰版新增多智能体调度能力',summary:'GPT-5.6 分为 Sol/Terra/Luna 三个版本，其中 Sol 旗舰版新增 Ultra 多智能体模式，可同时调度多个 AI 协同完成复杂任务。Terra 主打企业级性价比，Luna 侧重低延迟实时问答并上线全双工语音模型。',tags:['大模型','多智能体'],source:'OpenAI · 7月10日'},
{title:'DeepSeek-V4 发布：首创峰谷分时计费降低企业调用成本',summary:'DeepSeek-V4 在国内首创"峰谷分时计费"模式，大幅降低企业 API 调用成本。数学与代码能力保持顶尖水平，推理速度显著提升。7月24日将全面停用旧版 API。',tags:['大模型','成本优化'],source:'DeepSeek · 7月15日'},
{title:'月之暗面推出 Kimi K3：全球首个开源 3 万亿级大模型',summary:'Kimi K3 参数规模达 2.8 万亿，通过协同优化整体扩展效率提升约 2.5 倍。能独立完成芯片构建、优化与验证，高效处理科研编程和深度金融研报生成。原生 480K 上下文。',tags:['大模型','开源'],source:'月之暗面 · 7月'},
{title:'智谱 GLM-5.2：1M 超长上下文，Function Calling 达生产级',summary:'GLM-5.2 支持 100 万 Token 超长上下文窗口，Function Calling 达到生产级标准。以 MIT 协议全面开源 GLM 系列模型，产品已覆盖民生治理、工业制造、能源电力等 20 余个行业。',tags:['开源','Function Calling'],source:'智谱 AI · 7月上旬'},
{title:'腾讯混元 Hy-3 发布：MoE 架构 256K 上下文免费商用',summary:'Hy-3 采用 MoE 混合专家架构，支持 256K 上下文且免费商用。与微信生态、数字人、短视频深度打通，Agent 能力突出。支持华为昇腾芯片部署，推动国产算力生态。',tags:['MoE','Agent'],source:'腾讯 · 7月6日'},
{title:'Google 发布 Gemini-3.5 Pro：强化视频理解与 3D 解析',summary:'Gemini-3.5 Pro 采用全新训练基座，大幅强化视频理解、3D 解析和数学科研能力。原生对接搜索引擎，支持云端与端侧双部署模式。',tags:['大模型','多模态'],source:'Google · 7月17日'},
{title:'AI 物流供应链市场预计 2034 年达 1965.8 亿美元',summary:'据 Global Market Insights 最新报告，全球 AI 在物流与供应链领域的市场规模预计从当前水平增长至 2034 年的 1965.8 亿美元，需求预测、智能调度和预测性维护是三大核心增长驱动力。',tags:['供应链','市场趋势'],source:'SDC Executive · 7月'},
{title:'2026 被定义为"智能体爆发年"：从单 Agent 到多 Agent 协作',summary:'新华社报道指出，2026 年 AI Agent 从实验走向大规模落地，企业级多智能体系统开始覆盖订单-库存-排产-调度全链路。MCP 协议标准化和 Agent 编排框架成熟是两大推动力。',tags:['Agent','行业趋势'],source:'新华社 · 4月'}
];
let newsData={today:{date:'',items:fallbackNews},yesterday:{date:'',items:[]}};
let newsView='today';
function fmtDateLabel(d){if(!d)return'';const p=d.split('-');return p[1]+'/'+p[2];}
function updateNewsToggle(){
  const btns=document.querySelectorAll('.news-toggle-btn');
  btns.forEach(b=>{
    b.classList.toggle('active',b.dataset.date===newsView);
    const d=newsData[b.dataset.date];
    if(d&&d.date)b.textContent=(b.dataset.date==='today'?'今日 ':'昨日 ')+fmtDateLabel(d.date);
  });
}
function renderActiveNews(){
  const d=newsData[newsView];
  if(d&&d.items&&d.items.length)renderNews(d.items);
  else renderNewsEmpty();
}
(async()=>{
  try{
    const r=await fetch('news.json?v='+Date.now());
    if(r.ok){const j=await r.json();if(j.today)newsData.today=j.today;if(j.yesterday)newsData.yesterday=j.yesterday;}
  }catch(e){}
  updateNewsToggle();
  renderActiveNews();
  // ---- News Ticker ----
  const tItems=(newsData.today&&newsData.today.items)?newsData.today.items:fallbackNews;
  const tTitles=tItems.map(i=>i.title);
  const tEl=document.getElementById('ticker-content');
  if(tEl&&tTitles.length){
    const tHTML=tTitles.map((t,i)=>'<span data-idx="'+i+'">'+t+'</span>').join('');
    tEl.innerHTML=tHTML+tHTML;
    tEl.addEventListener('click',e=>{
      const sp=e.target.closest('span');
      if(!sp||sp.dataset.idx===undefined)return;
      const idx=parseInt(sp.dataset.idx);
      const cards=document.querySelectorAll('#news-grid .news-card');
      if(cards[idx]){
        document.getElementById('sec-news').scrollIntoView({behavior:'smooth'});
        setTimeout(()=>{cards[idx].scrollIntoView({behavior:'smooth',block:'center'});cards[idx].classList.add('highlight');setTimeout(()=>cards[idx].classList.remove('highlight'),2500);},500);
      }
    });
    document.getElementById('ticker-more').addEventListener('click',()=>{
      document.getElementById('sec-news').scrollIntoView({behavior:'smooth'});
    });
  }
})();
document.querySelectorAll('.news-toggle-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{newsView=btn.dataset.date;updateNewsToggle();renderActiveNews();});
});

// ---- Admin Mode ----
const isAdmin=new URLSearchParams(location.search).has('admin');
if(isAdmin){
  document.querySelectorAll('.admin-nav').forEach(el=>el.style.display='');
  document.getElementById('sec-articles').style.display='';
  document.getElementById('sec-skills').style.display='';
  (async()=>{
    try{
      const r=await fetch('articles.json?v='+Date.now());
      if(r.ok){const d=await r.json();if(d.articles&&d.articles.length){document.getElementById('articles-list').innerHTML=d.articles.map(a=>'<div class="article-card"><div class="article-title"><a href="'+a.url+'" target="_blank">'+a.title+'</a></div>'+(a.summary?'<div class="article-summary">'+a.summary+'</div>':'')+'<div class="article-meta">'+(a.author?'<span>'+a.author+'</span>':'')+(a.date?'<span>'+a.date+'</span>':'')+(a.tags?a.tags.map(t=>'<span class="news-tag">'+t+'</span>').join(''):'')+'</div></div>').join('');return;}}
    }catch(e){}
    document.getElementById('articles-list').innerHTML='<div class="news-empty">暂无文章，等待添加</div>';
  })();
  (async()=>{
    try{
      const r=await fetch('skills.json?v='+Date.now());
      if(r.ok){const d=await r.json();if(d.skills&&d.skills.length){document.getElementById('skills-list').innerHTML=d.skills.map(s=>'<div class="skill-card"><div class="skill-info"><div class="skill-name">'+s.name+'</div><div class="skill-desc">'+s.description+'</div><div class="skill-meta">'+(s.version?'<span>v'+s.version+'</span>':'')+(s.author?'<span>'+s.author+'</span>':'')+(s.downloads?'<span>下载 '+s.downloads+'</span>':'')+'</div></div><a class="skill-dl-btn" href="'+s.downloadUrl+'" target="_blank">下载</a></div>').join('');return;}}
    }catch(e){}
    document.getElementById('skills-list').innerHTML='<div class="news-empty">暂无 Skill 包，等待添加</div>';
  })();
}

renderExerciseHistory();

// Legend
const legendEl=document.getElementById('legend');
[...new Set(nodes.map(n=>n.cat))].forEach(cat=>{
  if(!CAT_COLORS[cat])CAT_COLORS[cat]='#94a3b8';
  legendEl.innerHTML+='<div class="legend-item" data-cat="'+cat+'"><div class="legend-dot" style="background:'+CAT_COLORS[cat]+'"></div>'+cat+'</div>';
});

// ---- D3 Graph ----
const svgEl=document.getElementById('graph-svg');
const W=svgEl.clientWidth,H=svgEl.clientHeight;
const svg=d3.select('#graph-svg');
const g=svg.append('g');

// SVG glow filters
const defs=svg.append('defs');
const fGlow=defs.append('filter').attr('id','glow').attr('x','-50%').attr('y','-50%').attr('width','200%').attr('height','200%');
fGlow.append('feGaussianBlur').attr('stdDeviation','3').attr('result','b');
const fMerge=fGlow.append('feMerge');fMerge.append('feMergeNode').attr('in','b');fMerge.append('feMergeNode').attr('in','SourceGraphic');
const fSoft=defs.append('filter').attr('id','softGlow').attr('x','-100%').attr('y','-100%').attr('width','300%').attr('height','300%');
fSoft.append('feGaussianBlur').attr('stdDeviation','6').attr('result','b');
const fSM=fSoft.append('feMerge');fSM.append('feMergeNode').attr('in','b');fSM.append('feMergeNode').attr('in','SourceGraphic');

// Enhanced 3D orbital particles
const pG=g.append('g');
const pLineG=pG.append('g');
const PCOLS=['#60a5fa','#22d3ee','#a78bfa','#f472b6','#34d399'];
const pts=Array.from({length:60},()=>{
  const th=Math.random()*Math.PI*2,ph=Math.random()*Math.PI;
  const r=50+Math.random()*Math.min(W,H)*0.42;
  return{th,ph,r,spd:0.001+Math.random()*0.004,phSpd:(Math.random()-0.5)*0.001,
    sz:0.6+Math.random()*2.8,col:PCOLS[Math.floor(Math.random()*PCOLS.length)],
    o:0.1+Math.random()*0.35,x:0,y:0,depth:0,pulse:Math.random()*6.28};
});
const pCircles=pG.append('g').selectAll('circle').data(pts).join('circle')
  .attr('r',d=>d.sz).attr('fill',d=>d.col).attr('opacity',d=>d.o)
  .attr('class','particle').attr('filter','url(#glow)');

const zoomEl=document.getElementById('zoom-level');
const zoom=d3.zoom().scaleExtent([0.3,3]).filter(e=>{if(e.type==='wheel')return e.ctrlKey||e.metaKey;return!e.button;}).on('zoom',e=>{g.attr('transform',e.transform);if(zoomEl)zoomEl.textContent=Math.round(e.transform.k*100)+'%';});
svg.call(zoom);
// Set initial zoom to 100%
const initScale=1;
svg.call(zoom.transform,d3.zoomIdentity);
document.getElementById('graph-svg').addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey)e.preventDefault();},{passive:false});
document.getElementById('zoom-in').addEventListener('click',()=>svg.transition().duration(300).call(zoom.scaleBy,1.4));
document.getElementById('zoom-out').addEventListener('click',()=>svg.transition().duration(300).call(zoom.scaleBy,0.7));
document.getElementById('zoom-reset').addEventListener('click',()=>svg.transition().duration(400).call(zoom.transform,d3.zoomIdentity));
let hv=true;svg.on('mousedown.hint',()=>{if(hv){document.getElementById('scroll-hint').style.opacity='0';hv=false;}});

const cc={};edges.forEach(e=>{cc[e.source]=(cc[e.source]||0)+1;cc[e.target]=(cc[e.target]||0)+1;});

// 3D spherical node positioning
const R=Math.min(W,H)*0.3;
const cL=Object.keys(CAT_COLORS),cC={};
cL.forEach((cat,i)=>{const th=(i/cL.length)*Math.PI*2,ph=Math.PI*0.3+(i%3)*Math.PI*0.2;cC[cat]={th,ph};});
nodes.forEach(n=>{
  const c=cC[n.cat]||{th:0,ph:Math.PI/2};
  n.th=c.th+(Math.random()-0.5)*0.9;
  n.ph=c.ph+(Math.random()-0.5)*0.5;
  n.x=R*Math.sin(n.ph)*Math.cos(n.th);
  n.y=R*Math.cos(n.ph);
  n.z=R*Math.sin(n.ph)*Math.sin(n.th);
  n.r=Math.max(6,Math.min(18,4+(cc[n.id]||0)*1.8));
});

const sim=d3.forceSimulation(nodes)
  .force('link',d3.forceLink(edges).id(d=>d.id).distance(60).strength(0.3))
  .force('charge',d3.forceManyBody().strength(-100))
  .force('collision',d3.forceCollide().radius(d=>d.r+6))
  .force('radial',d3.forceRadial(R,0,0).strength(0.12));

const lG=g.append('g');
const link=lG.selectAll('line').data(edges).join('line').attr('stroke','#64748b').attr('stroke-width',1);

const nG=g.append('g');
const node=nG.selectAll('g').data(nodes).join('g').attr('cursor','pointer').classed('node-new',d=>newIdSet.has(d.id)).attr('data-id',d=>d.id);

node.append('circle').attr('r',d=>d.r).attr('fill',d=>CAT_COLORS[d.cat]).attr('fill-opacity',0.7).attr('stroke',d=>CAT_COLORS[d.cat]).attr('stroke-width',d=>newIdSet.has(d.id)?3:1.5).attr('stroke-opacity',d=>newIdSet.has(d.id)?0.9:0.4);
node.filter(d=>newIdSet.has(d.id)).select('circle').style('filter',d=>'drop-shadow(0 0 8px '+CAT_COLORS[d.cat]+'80)');

node.append('text').text(d=>d.name).attr('text-anchor','middle').attr('dy',d=>d.r+14).attr('fill','#94a3b8').attr('font-size',d=>d.name.length>10?8:d.name.length>7?9:10).attr('pointer-events','none');
node.filter(d=>newIdSet.has(d.id)).append('text').text('NEW').attr('class','new-badge').attr('text-anchor','middle').attr('dy',d=>-d.r-6);

const tt=document.getElementById('tooltip');
node.on('mouseover',(e,d)=>{tt.querySelector('.tt-name').textContent=d.name;tt.querySelector('.tt-cat').textContent=d.cat;tt.style.opacity=1;d3.select(e.currentTarget).select('circle').transition().duration(200).attr('fill-opacity',1).attr('stroke-opacity',0.8).attr('stroke-width',3).style('filter','drop-shadow(0 0 8px '+CAT_COLORS[d.cat]+'60)');}).on('mousemove',e=>{tt.style.left=(e.clientX+16)+'px';tt.style.top=(e.clientY-10)+'px';}).on('mouseout',e=>{tt.style.opacity=0;if(!document.getElementById('detail-panel').classList.contains('active')&&!sA){d3.select(e.currentTarget).select('circle').transition().duration(300).attr('fill-opacity',0.7).attr('stroke-opacity',0.4).attr('stroke-width',1.5).style('filter',d=>newIdSet.has(d.id)?'drop-shadow(0 0 8px '+CAT_COLORS[d.cat]+'80)':'none');}});

node.on('click',(e,d)=>{e.stopPropagation();showDetail(d);hlNode(d);});
svg.on('click',()=>{hideDetail();if(!sA)resetHL();});

sim.on('tick',()=>{});// sim only resolves forces; rendering in rotation loop

// ---- 3D rotation + projection render loop ----
let rotY=0,rotSpeed=0.001,targetSpeed=0.001;
let FOV=800,CX=W/2,CY=H/2;
let dimSet=null;

nG.on('mouseover',()=>{targetSpeed=0;})
    .on('mouseout',()=>{targetSpeed=0.001;});

(function animate3D(){
  // Smooth rotation speed transition
  rotSpeed+=(targetSpeed-rotSpeed)*0.05;
  rotY+=rotSpeed;
  const cY=Math.cos(rotY),sY=Math.sin(rotY);

  // Project nodes: 3D→2D with perspective
  nodes.forEach(d=>{
    const rx=d.x*cY-d.z*sY, rz=d.x*sY+d.z*cY;
    const sc=FOV/(FOV+rz);
    d.sx=rx*sc+CX; d.sy=d.y*sc+CY; d.sc=sc; d.depth=rz;
  });

  // Update node positions with depth-based scale & opacity
  node.attr('transform',d=>'translate('+d.sx+','+d.sy+') scale('+d.sc+')')
      .attr('opacity',d=>{const base=Math.max(0.18,Math.min(1,(d.sc-0.55)*2.8));return dimSet?(dimSet.has(d.id)?base:0.06):base;});

  // Update links with depth-based opacity for 3D volume
  link.attr('x1',d=>d.source.sx).attr('y1',d=>d.source.sy)
      .attr('x2',d=>d.target.sx).attr('y2',d=>d.target.sy)
      .attr('opacity',d=>{const as=(d.source.sc+d.target.sc)/2;return Math.max(0.1,(as-0.55)*0.8);});

  // Depth-sort nodes (back to front) every 10 frames
  if(Math.random()<0.1){
    const sorted=[...nodes].sort((a,b)=>a.depth-b.depth);
    sorted.forEach(d=>{const el=document.querySelector('[data-id="'+d.id+'"]');if(el)el.parentNode.appendChild(el);});
  }

  // Orbital particles
  pts.forEach(p=>{
    p.th+=p.spd; p.ph+=p.phSpd; p.pulse+=0.02;
    const px=p.r*Math.sin(p.ph)*Math.cos(p.th);
    const py=p.r*Math.cos(p.ph);
    const pz=p.r*Math.sin(p.ph)*Math.sin(p.th);
    const rx2=px*cY-pz*sY, rz2=px*sY+pz*cY;
    const sc=FOV/(FOV+rz2);
    p.x=rx2*sc+CX; p.y=py*sc+CY; p.depth=rz2;
    p.curO=p.o*(0.4+0.6*Math.max(0,(sc-0.5)*2.5))*(0.7+0.3*Math.sin(p.pulse));
    p.curR=p.sz*sc;
  });
  pCircles.attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r',d=>d.curR).attr('opacity',d=>d.curO);

  // Constellation lines between nearby particles (draw every 3 frames)
  if(Math.random()<0.33){
    let lHTML='';
    for(let i=0;i<pts.length;i++){for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<80){const o=Math.max(0,(1-dist/80)*0.06*Math.min(pts[i].curO,pts[j].curO)*8);
        lHTML+='<line x1="'+pts[i].x+'" y1="'+pts[i].y+'" x2="'+pts[j].x+'" y2="'+pts[j].y+'" stroke="#60a5fa" stroke-width="0.5" opacity="'+o+'"/>';
    }}}
    pLineG.html(lHTML);
  }

  requestAnimationFrame(animate3D);
})();

function hlNode(d){
  const ids=new Set([d.id]);
  edges.forEach(e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;if(s===d.id)ids.add(t);if(t===d.id)ids.add(s);});
  dimSet=ids;
  node.classed('node-dim',n=>!ids.has(n.id)).classed('node-hl',n=>ids.has(n.id));
  link.transition().duration(300).attr('stroke',e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;return(s===d.id||t===d.id)?CAT_COLORS[d.cat]:'rgba(148,163,184,0.1)';}).attr('stroke-width',e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;return(s===d.id||t===d.id)?2:0.5;});
}
let sA=false,lA=null;
function resetHL(){
  dimSet=null;
  node.classed('node-dim',false).classed('node-hl',false);
  node.select('circle').transition().duration(300).attr('fill-opacity',0.7).attr('stroke-opacity',0.4).attr('stroke-width',1.5).style('filter',d=>newIdSet.has(d.id)?'drop-shadow(0 0 8px '+CAT_COLORS[d.cat]+'80)':'none');
  node.select('text').transition().duration(300).attr('fill-opacity',1);
  link.transition().duration(300).attr('stroke','#64748b').attr('stroke-width',1);
  document.querySelectorAll('.legend-item.active').forEach(el=>el.classList.remove('active'));
  lA=null;
}
function showDetail(d){
  const p=document.getElementById('detail-panel'),c=CAT_COLORS[d.cat];
  document.getElementById('dp-badge').textContent=d.cat;document.getElementById('dp-badge').style.background=c+'20';document.getElementById('dp-badge').style.color=c;
  document.getElementById('dp-name').textContent=d.name;document.getElementById('dp-desc').textContent=d.desc;
  const pm=document.getElementById('dp-pm');if(d.pm){pm.style.display='block';document.getElementById('dp-pm-text').textContent=d.pm;}else pm.style.display='none';
  // Learning paths containing this node
  const relPaths=learningPaths.filter(lp=>lp.nodes.includes(d.id));
  const pathsEl=document.getElementById('dp-paths'),pathsList=document.getElementById('dp-paths-list');
  if(relPaths.length){pathsEl.style.display='block';pathsList.innerHTML=relPaths.map(lp=>{const idx=lp.nodes.indexOf(d.id);return'<div class="dp-path-tag" style="border-color:'+lp.color+'40;color:'+lp.color+'">'+lp.name+'<span class="dp-path-step"> · 第'+(idx+1)+'步 / 共'+lp.nodes.length+'步</span></div>';}).join('');}else pathsEl.style.display='none';
  const rel=[];edges.forEach(e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;if(s===d.id){const n=nodes.find(x=>x.id===t);if(n)rel.push(n);}if(t===d.id){const n=nodes.find(x=>x.id===s);if(n)rel.push(n);}});
  document.getElementById('dp-related').innerHTML=rel.map(r=>'<span class="dp-tag" data-id="'+r.id+'" style="border-color:'+CAT_COLORS[r.cat]+'40">'+r.name+'</span>').join('');
  document.querySelectorAll('.dp-tag').forEach(tag=>{tag.addEventListener('click',()=>{const nd=nodes.find(n=>n.id===tag.dataset.id);if(nd){showDetail(nd);hlNode(nd);}});});
  p.classList.add('active');
}
function hideDetail(){document.getElementById('detail-panel').classList.remove('active');}
document.getElementById('dp-close').addEventListener('click',()=>{hideDetail();if(!sA)resetHL();});

// Graph search (centered)
const gsi=document.getElementById('graph-search-input'),mce=document.getElementById('match-count');
gsi.addEventListener('input',()=>{
  const q=gsi.value.trim().toLowerCase();
  if(!q){sA=false;lA=null;resetHL();mce.textContent='';return;}
  sA=true;lA=null;
  document.querySelectorAll('.legend-item.active').forEach(el=>el.classList.remove('active'));
  const mIds=new Set();
  nodes.forEach(n=>{if(n.name.toLowerCase().includes(q)||n.desc.toLowerCase().includes(q)||n.cat.toLowerCase().includes(q)||(n.pm&&n.pm.toLowerCase().includes(q)))mIds.add(n.id);});
  dimSet=mIds;
  mce.textContent=mIds.size+'/'+nodes.length;
  node.classed('node-dim',n=>!mIds.has(n.id)).classed('node-hl',n=>mIds.has(n.id));
  link.transition().duration(200).attr('stroke',e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;return(mIds.has(s)&&mIds.has(t))?'rgba(148,163,184,0.4)':'rgba(148,163,184,0.08)';});
});

// Legend click: highlight nodes by category (toggle on/off, mutually exclusive with search)
document.querySelectorAll('.legend-item').forEach(item=>{
  item.addEventListener('click',()=>{
    const cat=item.dataset.cat;
    if(lA===cat){lA=null;resetHL();return;}
    lA=cat;sA=false;gsi.value='';mce.textContent='';
    document.querySelectorAll('.legend-item').forEach(el=>el.classList.remove('active'));
    item.classList.add('active');
    const catIds=new Set(nodes.filter(n=>n.cat===cat).map(n=>n.id));
    dimSet=catIds;
    node.classed('node-dim',n=>!catIds.has(n.id)).classed('node-hl',n=>catIds.has(n.id));
    node.select('circle').transition().duration(300)
      .attr('fill-opacity',n=>catIds.has(n.id)?1:0.15)
      .attr('stroke-opacity',n=>catIds.has(n.id)?0.8:0.1)
      .attr('stroke-width',n=>catIds.has(n.id)?3:1);
    node.select('text').transition().duration(300).attr('fill-opacity',n=>catIds.has(n.id)?1:0.2);
    link.transition().duration(300)
      .attr('stroke',e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;return(catIds.has(s)&&catIds.has(t))?CAT_COLORS[cat]+'80':'rgba(148,163,184,0.08)';})
      .attr('stroke-width',e=>{const s=typeof e.source==='object'?e.source.id:e.source,t=typeof e.target==='object'?e.target.id:e.target;return(catIds.has(s)&&catIds.has(t))?2:0.5;});
  });
});

window.addEventListener('resize',()=>{const nW=svgEl.clientWidth,nH=svgEl.clientHeight;CX=nW/2;CY=nH/2;sim.alpha(0.3).restart();});

// Expose graph API globally for learning path clicks
window._graphAPI = { showDetail, highlightNode: hlNode };

// ---- Back to Top ----
const btt=document.getElementById('back-to-top');
window.addEventListener('scroll',()=>{if(btt)btt.classList.toggle('show',window.scrollY>400);});
if(btt)btt.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

})(); // close async IIFE
