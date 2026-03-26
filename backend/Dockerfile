FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN if [ -f "pom.xml" ]; then \
			mvn -q clean package -DskipTests; \
			cp target/*.jar /app/app.jar; \
		elif [ -f "knowgap/pom.xml" ]; then \
			cd knowgap && mvn -q clean package -DskipTests; \
			cp target/*.jar /app/app.jar; \
		else \
			echo "No pom.xml found in build context" && exit 1; \
		fi

FROM eclipse-temurin:21-jre-jammy
COPY --from=build /app/app.jar /app.jar
ENTRYPOINT ["java","-jar","/app.jar"]