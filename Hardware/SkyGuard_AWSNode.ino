#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

// ==========================================
// NETWORK & BACKEND CONFIGURATION
// ==========================================
const char* ssid = "vivo T3 Pro 5G";
const char* password = "01234567";

// Exact URL from your Hoppscotch (with trailing slash)
const char* serverName = "https://vayu-drishti-h8xr.onrender.com/api/v1/telemetry/";

// Exact token prefix matching your Django/Hoppscotch setup ("Token" instead of "Bearer")
const char* authToken = "Token e68722111099b523a0dc47ea2fa29c48d85fa1c8";

// ==========================================
// HARDWARE PINS & SENSORS
// ==========================================
#define DHTPIN 0          // DHT11 Data pin connected to D3 (GPIO 0)
#define DHTTYPE DHT11     

Adafruit_BMP280 bmp;      // BMP280 (SDA = D2, SCL = D1)
DHT dht(DHTPIN, DHTTYPE); 

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n=================================");
  Serial.println("SKYGUARD AI - TELEMETRY NODE");
  Serial.println("=================================");

  // Initialize I2C for BMP280
  Wire.begin(4, 5); // SDA = D2, SCL = D1

  // Start BMP280
  if (!bmp.begin(0x76) && !bmp.begin(0x77)) {
    Serial.println("[ERROR] BMP280 not found! Check D1/D2 wiring.");
    while (1) delay(10); 
  }
  
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,     
                  Adafruit_BMP280::SAMPLING_X2,     
                  Adafruit_BMP280::SAMPLING_X16,    
                  Adafruit_BMP280::FILTER_X16,      
                  Adafruit_BMP280::STANDBY_MS_500); 

  // Start DHT11
  dht.begin();

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n[SUCCESS] Connected to Wi-Fi!");
  Serial.print("ESP8266 IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.println("=================================\n");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // Bypass SSL certificate for Render
    
    HTTPClient http;

    http.begin(client, serverName);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", authToken); // Matches your Hoppscotch header format exactly

    // 1. Read real sensor data
    float temp = bmp.readTemperature();
    float pres = bmp.readPressure() / 100.0F; // Convert to hPa
    float hum = dht.readHumidity();

    // Verify DHT11 reading
    if (isnan(hum)) {
      Serial.println("[WARNING] Failed to read from DHT11. Skipping this transmission cycle.");
    } else {
      // 2. Package data into the exact JSON format from your Hoppscotch body
      String jsonPayload = "{\n"
                           "  \"station\": \"Demo_Station\",\n"
                           "  \"temperature\": " + String(temp, 1) + ",\n"
                           "  \"humidity\": " + String(hum, 1) + ",\n"
                           "  \"pressure\": " + String(pres, 1) + "\n"
                           "}";

      Serial.println("Sending Payload:");
      Serial.println(jsonPayload);

      // 3. Send HTTP POST request
      int httpResponseCode = http.POST(jsonPayload);

      if (httpResponseCode > 0) {
        Serial.print("Server Response Code: ");
        Serial.println(httpResponseCode);
        String response = http.getString();
        Serial.println("Response Body: " + response);
      } else {
        Serial.print("HTTP Error Code: ");
        Serial.println(httpResponseCode);
      }
    }

    http.end(); // Free HTTP resources
  } else {
    Serial.println("[WARNING] Wi-Fi Disconnected. Trying to reconnect...");
    WiFi.begin(ssid, password);
  }

  // Delay 5 seconds between transmissions
  delay(5000);
}