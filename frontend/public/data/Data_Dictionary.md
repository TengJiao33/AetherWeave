# 苍穹织网 数据字典与验收状态 (Data Dictionary & Status)

**当前状态**：第一阶段原始数据募集与 Python 预处理**已全部竣工验收**。所有前端页面目前直接从 `data/processed/` 加载格式化好的可用数据。

**覆盖城市**：深圳南山、北京核心（朝阳+海淀+西城）、上海核心（浦东+静安+黄浦）、广州核心（天河+越秀+海珠）、成都核心（锦江+武侯+高新）、重庆主城（渝中+南岸+江北+沙坪坝）

---

## 1. 无人机轨迹数据集 (UAV Trajectories)

用于记录基于城市地形与禁飞区规划的无人机三维活动与姿态数据。
此数据并非简单的随机生成，而是融合了以下真实参考源进行计算：
- 动力学特性提取自真实合成训练集 (`riotu-lab/Synthetic-UAV-Trajectories`)：包含典型的巡航速度分布、加速度模式及微小扰动特征。
- 物流航路与禁飞区避让基于城市真实地理数据。
- 飞行能耗计算完全基于本项目的 AirLab 真实消耗模型映射。

**存储位置**: `data/processed/trajectories/uav_trajectories.csv`

| 字段名 (Field Name) | 数据类型 (Type) | 单位 (Unit) | 描述 (Description) | 备注 |
| :--- | :--- | :--- | :--- | :--- |
| `flight_id` | String | - | 航班/任务唯一标识符 | 用于区分不同的飞行架次 |
| `timestamp` | Float/Int | Unix/ms | 记录当前时间戳 | 秒级Unix时间戳偏移 |
| `lat` | Float | Degree | WGS84 纬度 | 如 22.5333 |
| `lon` | Float | Degree | WGS84 经度 | 如 113.9300 |
| `alt_abs` | Float | Meters (m) | 绝对海拔高度 | 基于MSL |
| `alt_rel` | Float | Meters (m) | 相对起飞点高度 | 50m - 120m巡航区间 |
| `speed_x` | Float | m/s | X轴速度分量 (东西向) | - |
| `speed_y` | Float | m/s | Y轴速度分量 (南北向) | - |
| `speed_z` | Float | m/s | Z轴速度分量 (垂直向上) | - |
| `roll` | Float | Degree/Rad | 滚转角 | 飞行器绕纵轴旋转角 |
| `pitch` | Float | Degree/Rad | 俯仰角 | 飞行器绕横轴旋转角 |
| `yaw` | Float | Degree/Rad | 偏航角 | 飞行器绕立轴旋转角 |
| `battery_rem` | Float | % / mAh | 剩余电量 | 评估耗能模型的核心字段 |

---

## 2. 城市三维建筑地理底座 (Urban 3D Buildings)

用于碰撞检测与微气象生成的城市物理空间多边形。
**存储位置**: `data/processed/{city}/buildings_3d.geojson`

*数据格式: GeoJSON (FeatureCollection)*

| 属性名 (Property) | 数据类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `osm_id` | String | OpenStreetMap 中的原始建筑 ID。 |
| `name` | String | 建筑名称。 |
| `building` | String | 建筑类型 (如 `commercial`, `residential`, `yes`)。 |
| `height` | Float | 建筑绝对高度(米)。由 Python 脚本依据真实楼层乘3米推断，或基于高区正态分布随机生成兜底。 |
| `geometry` | Polygon | 建筑底部轮廓经纬度多边形集合。 |

---

## 3. 敏感禁飞区与需求起降点 (POI Nodes)

用于规划审批的避障红区和机坪选址的热力源。
**存储位置**: 
- `data/processed/{city}/poi_sensitive.geojson` (红色禁飞基站)
- `data/processed/{city}/poi_demand.geojson` (绿色起降热力点)

*数据格式: GeoJSON (FeatureCollection)*

| 属性名 (Property) | 数据类型 (Type) | 描述 (Description) |
| :--- | :--- | :--- |
| `poi_id` | String | 抓取来源的唯一ID。 |
| `name` | String | POI 名称 (如 "南山区人民医院")。 |
| `type` | String | 类别 (如 `hospital`, `school`, `office`, `residential`)。 |
| `weight` | Float | 权重值 (例如：禁飞权重或物流吞吐量权重)。 |
| `geometry` | Point | 真实的经纬度坐标点。 |

---

## 4. 真实无人机飞行能耗数据集 (AirLab Flight Energy) ✅

来自卡内基梅隆大学 AirLab 的 DJI Matrice 100 真实飞行实验数据，共 187 次有效飞行。

**来源**: CMU AirLab — [DOI: 10.1184/R1/12683453](https://doi.org/10.1184/R1/12683453)  
**设备**: DJI Matrice 100 (工业级四旋翼)  
**原始位置**: `data/raw/airlab_energy/data/{flight_number}/processed.csv`  
**清洗位置**: `data/processed/airlab_energy/`  
**实验参数**: 载荷 0g/250g/500g，高度 25-100m，速度 4-12 m/s  
**采样率**: ~7-10 Hz

### 4.1 飞行汇总 (flights_summary.csv)

每次飞行的统计摘要，共 187 行。

| 字段名 | 类型 | 单位 | 描述 |
| :--- | :--- | :--- | :--- |
| `flight_id` | String | - | 唯一标识 (AIRLAB_XXXX) |
| `flight_number` | Int | - | 原始飞行编号 |
| `route` | String | - | 航线编号 |
| `aircraft` | String | - | 飞行器型号 |
| `date` | String | - | 飞行日期 |
| `payload_kg` | Float | kg | 载荷重量 |
| `duration_s` | Float | s | 飞行时长 |
| `max_altitude_m` | Float | m | 最大相对高度 |
| `avg_airspeed_ms` | Float | m/s | 平均空速 |
| `max_airspeed_ms` | Float | m/s | 最大空速 |
| `avg_power_w` | Float | W | 平均功率 |
| `max_power_w` | Float | W | 最大功率 |
| `min_power_w` | Float | W | 最小功率 |
| `total_energy_wh` | Float | Wh | 累计能耗 (梯形积分) |
| `energy_per_second_wh` | Float | Wh/s | 秒均能耗 |
| `avg_density` | Float | kg/m³ | 平均空气密度 |
| `sample_count` | Int | - | 采样点数 |
| `sample_rate_hz` | Float | Hz | 实际采样率 |

### 4.2 飞行明细 (flights_detail.csv)

全部时序数据合并，共 162,933 行。

| 字段名 | 类型 | 单位 | 描述 |
| :--- | :--- | :--- | :--- |
| `flight_id` | String | - | 关联 flight_id |
| `time` | Float | s | 飞行时间戳 |
| `airspeed` | Float | m/s | 空速 |
| `vertspd` | Float | m/s | 垂直速度 |
| `diffalt` | Float | m | 相对起飞点高度差 |
| `payload` | Float | kg | 载荷重量 |
| `power` | Float | W | 瞬时功率 |
| `density` | Float | kg/m³ | 空气密度 |
| `airspeed_x` | Float | m/s | 空速 X 分量 |
| `airspeed_y` | Float | m/s | 空速 Y 分量 |
| `psi` | Float | rad | 风向角 |
| `aoa` | Float | rad | 攻角 |
| `theta` | Float | rad | 俯仰角 |
