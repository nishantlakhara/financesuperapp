package com.finance.superapp.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI financeSuperappOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Finance Superapp API")
                        .description("REST APIs for the finance utilities superapp.")
                        .version("v1")
                        .contact(new Contact()
                                .name("Finance Superapp")
                                .url("https://github.com/nishantlakhara/financesuperapp"))
                        .license(new License()
                                .name("Internal / Demo Use")));
    }
}
