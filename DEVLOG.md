# DEVLOG & CHANGELOG

> 记录依赖变动、核心重构或重大 Bug 排查结果
> 格式：`## MM-DD [你的名字] 变更简述`

## 03-09 [应飞扬] 能源数据结构
  1. 算法端重写了 `generate_energy.py`，加入了基于真实载重和物理阻力的耗电推演。
  2. 在前端最终产出的轨迹 JSON 中追加了 `energy_data` 节点（包含电池流失曲线和载重上限）
  3. 前端侧新增并完善了 `FlightDetailPanel` 悬浮组件以消费此数据。
如果有旧的生成数据没有这个节点，前端渲染时可能会白屏报错，请必须用最新的 `batch_generate.py` 重新跑一遍全城数据。（但是源数据我还没有git，主要原因是大小）

## 03-08 [应飞扬] MapContainer 重构
  1. 将曾经高达 800 行的 `MapContainer.tsx` 进行了拆分。
  2. 把取数据的逻辑剥离到了 `useCityData` Hook 中
  3. 把控制无人机怎么飞的 `requestAnimationFrame` 剥离到了 `useUAVAnimation` 中
  4. 抽离了纯静态展现的 `DashboardOverlay`
