# ใช้ JDK 17
FROM openjdk:17-jdk-slim AS builder

# ตั้ง working directory
WORKDIR /app

# Copy Gradle wrapper และไฟล์ config
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# ดาวน์โหลด dependencies ล่วงหน้า
RUN ./gradlew build -x test --continue || true

# Copy source code ทั้งหมด
COPY . .

# สร้าง jar ไฟล์
RUN chmod +x gradlew
RUN ./gradlew clean bootJar -x test

# ========= Stage 2 =========
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy jar ที่ build เสร็จแล้วมา
COPY --from=builder /app/build/libs/*.jar app.jar

# Run app
ENTRYPOINT ["java", "-jar", "app.jar"]
