package com.finance.superapp;

import com.finance.superapp.common.config.AppSecurityProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppSecurityProperties.class)
public class FinanceSuperappApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceSuperappApplication.class, args);
    }
}
