CREATE TABLE services (
                          id SERIAL PRIMARY KEY,
                          name VARCHAR(100) NOT NULL,
                          description TEXT,
                          price INTEGER NOT NULL,
                          duration INTEGER
);

INSERT INTO services (name, description, price, duration) VALUES
                                                              ('Комбинированный маникюр', 'Обработка ногтей, покрытие лаком', 2000, 90),
                                                              ('Аппаратный маникюр', 'Использование профессионального аппарата', 2300, 90);