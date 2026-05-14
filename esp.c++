#include <WiFi.h>
#include <WebServer.h>

// Configurações do Wi-Fi
const char* ssid = "RAFAEL 2.4/5G";
const char* password = "32261973";

WebServer server(80);

// Página HTML que ficará DENTRO do ESP32
const char INDEX_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Gennus - Interface Hardware</title>
    <style>
        body { font-family: sans-serif; text-align: center; background: #121212; color: white; padding: 50px; }
        .card { background: #1e1e1e; padding: 20px; border-radius: 15px; border: 2px solid #3498db; }
        .btn { background: #3498db; color: white; padding: 20px; border: none; border-radius: 10px; font-size: 20px; cursor: pointer; }
        .btn:active { background: #2980b9; }
        #status { margin-top: 20px; color: #2ecc71; font-weight: bold; }
    </style>
</head>
<body>
    <div class="card">
        <h1>GENNUS ERP</h1>
        <h3>Módulo Ciberfísico - ESP32</h3>
        <p>Ação de Hardware via Mobile</p>
        <button class="btn" onclick="fazerBaixa()">CONFIRMAR BAIXA FÍSICA</button>
        <div id="status"></div>
    </div>

    <script>
        function fazerBaixa() {
            document.getElementById('status').innerText = "Processando no Banco...";
            // Chama a rota do próprio ESP32 que você vai criar no Node.js depois
            fetch('/confirmar').then(() => {
                document.getElementById('status').innerText = "BAIXA CONCLUÍDA NO SQL!";
                setTimeout(() => document.getElementById('status').innerText = "", 3000);
            });
        }
    </script>
</body>
</html>
)rawliteral";

void handleRoot() {
  server.send(200, "text/html", INDEX_HTML);
}

void handleConfirmar() {
  // Acende o LED interno do ESP32 por 2 segundos para mostrar a ação física
  digitalWrite(2, HIGH);
  delay(1000);
  digitalWrite(2, LOW);
  server.send(200, "text/plain", "OK");
}

void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT); // LED Interno
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  
  Serial.println("");
  Serial.print("IP do ESP32: ");