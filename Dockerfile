FROM node:22-alpine AS inventory

WORKDIR /workspace

COPY . .

RUN node javascript/generate-inventory.js /workspace/project-inventory.json

FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /workspace

COPY pom.xml .
COPY src ./src
COPY html ./html
COPY javascript ./javascript
COPY --from=inventory /workspace/project-inventory.json src/main/resources/static/project-inventory.json

RUN mkdir -p src/main/resources/static/javascript \
    && cp html/*.html src/main/resources/static/ \
    && cp javascript/registration.js javascript/forgot-password.js javascript/dashboard.js src/main/resources/static/javascript/ \
    && mvn -B package

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN groupadd --system app \
    && useradd --system --gid app --home-dir /app app \
    && mkdir -p /app/data \
    && chown -R app:app /app

COPY --from=build --chown=app:app /workspace/target/registration-service-1.0.0.jar /app/app.jar

USER app

EXPOSE 8080
VOLUME ["/app/data"]

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
