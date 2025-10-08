# ใช้ JDK 17
FROM openjdk:17-jdk-slim AS builder

# ตั้ง working directory
WORKDIR /app

# Copy Gradle wrapper และไฟล์ config
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# ให้สิทธิ์รัน gradlew
RUN chmod +x gradlew

# ดาวน์โหลด dependencies ล่วงหน้า
RUN ./gradlew dependencies --no-daemon || true

# Copy source code ทั้งหมด
COPY src src

# สร้าง jar ไฟล์
RUN ./gradlew clean bootJar -x test --no-daemon

# ========= Stage 2 =========
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy jar ที่ build เสร็จแล้วมา
COPY --from=builder /app/build/libs/*.jar app.jar

# Run app
ENTRYPOINT ["java", "-jar", "app.jar"]
