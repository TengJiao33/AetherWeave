# 国家基础学科公共科学数据中心 - 无人机飞行状态数据

## 数据简介
- **数据源**: DJI M300 无人机飞控数据
- **采集方式**: ROS 订阅话题获取飞控数据
- **内容**: 位置、姿态、飞行速度、角速度、原始IMU和RTK数据
- **数据量**: 约150MB

## 下载方式
1. 访问 https://www.nbsdc.cn
2. 搜索 "无人机飞行状态数据"
3. 注册/登录后下载
4. 将下载的文件放在此目录下

## 数据格式
数据通过ROS bag文件或CSV导出，包含以下字段:
- timestamp: 时间戳
- position_x/y/z: 位置坐标
- orientation_roll/pitch/yaw: 姿态角
- velocity_x/y/z: 飞行速度
- angular_velocity_x/y/z: 角速度
- imu_accel_x/y/z: IMU加速度
- imu_gyro_x/y/z: IMU陀螺仪
- rtk_lat/lon/alt: RTK差分定位
