# Stage 1: Build the application with Maven
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to leverage Docker cache
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Create the final, lightweight runtime image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copy the built JAR from the 'build' stage
COPY --from=build /app/target/expenseTracker-0.0.1-SNAPSHOT.jar app.jar
# Port will be dynamically set via PORT environment variable (configured in application.properties)
EXPOSE ${PORT:-8080}
# Spring Boot will read PORT from environment via application.properties
ENTRYPOINT ["java", "-jar", "app.jar"]