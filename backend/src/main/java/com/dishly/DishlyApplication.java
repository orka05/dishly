package com.dishly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DishlyApplication {

	public static void main(String[] args) {
		SpringApplication.run(DishlyApplication.class, args);
	}

}
