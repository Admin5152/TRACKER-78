# Use an official OpenJDK image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy the built jar from target folder
COPY target/Tracker-78-0.0.1-SNAPSHOT.jar app.jar

# Set environment variables (optional fallback values)
APPWRITE_PROJECTID=683f5658000ba43c36cd
APPWRITE_URL=https://gra.cloud.appwrite.io/v1/683f5658000ba43c36cd
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
DB_PASSWORD=Gamersjr002$
DB_USERNAME=Tracker_78_spring
API_KEY=683f5658000ba43c36cd
EXPIRES_IN=900000
JWT_SECRET=Tracker-78
REFRESH_EXPIRES_IN=604800000
DB_URL=jdbc:postgresql://localhost:5432/Tracker78_spring


# Expose the default Spring Boot port
EXPOSE 8081

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]