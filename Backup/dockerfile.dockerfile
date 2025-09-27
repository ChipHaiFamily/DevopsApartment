FROM postgres:15
COPY . apartment_db.sql /
EXPOSE 5432