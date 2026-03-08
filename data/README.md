# 苍穹织网项目 数据仓库说明 (Data Repository README)

**状态更新 (2026-02-27)**:
当前数据收集阶段（Phase 1）与清洗预处理阶段（Phase 2）**已全部竣工验收**。
前端系统已可满负荷稳定渲染 `data/processed/` 目录下的所有结构化成果文件。

**覆盖城市**: 深圳南山 / 北京核心 / 上海核心 / 广州核心 / 成都核心 / 重庆主城 (共6城)

---

## 数据采集核心原则

本项目作为"低空经济大数据决策沙盘"的核心数据底座，弹药库已极其充足：6城市建筑基座、敏感避让点、高精度轨迹集，以及来自 CMU AirLab 的 188 次 DJI Matrice 100 真实飞行能耗数据。

## 目录结构管理规范
*   **`data/`** (数据根目录)
    *   **`raw/`**: **【封存】原始数据池**。根级存放各城市 Overpass 原始 JSON（如 `beijing_buildings_raw.json`）、深圳数据在 `shenzhen/` 子目录、飞行轨迹在 `trajectories/`、CMU AirLab 能耗数据在 `airlab_energy/`。**严禁手工修改。**
    *   **`processed/`**: **【活跃】处理后数据池**。按城市划分整理，包含 `trajectories/` 存放飞行轨迹。这是 Deck.gl 3D 可视化引擎的直接数据源。
    *   **`Data_Dictionary.md`**: **数据字典**。全域字段名、单位、数据类型的权威说明。

## 给后续开发者的使用提醒
1. **请不要再重复运行抓取脚本**以免触发公网 API 封禁。
2. 坐标统一使用 **WGS84** 经纬度体系，3D 碰撞计算请对接 `buildings_3d.geojson` 的建筑高度 (height) 与无人机高度。
3. AirLab 能耗数据可用于构建能耗预测模型，字段详见 `Data_Dictionary.md` 第4节。
