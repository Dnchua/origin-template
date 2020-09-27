package com.orange.demo.upmsservice;

import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.SpringCloudApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;

/**
 * upms服务启动类。
 *
 * @author Jerry
 * @date 2020-09-27
 */
@SpringCloudApplication
@EnableFeignClients(basePackages = "com.orange.demo")
@ComponentScan("com.orange.demo")
public class UpmsApplication {

	public static void main(String[] args) {
		SpringApplication.run(UpmsApplication.class, args);
	}
}
