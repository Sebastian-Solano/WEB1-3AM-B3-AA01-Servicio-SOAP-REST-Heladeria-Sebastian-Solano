param([string]$Soap = 'http://localhost:5102/ProductoService.asmx', [string]$Rest = 'http://localhost:5103/api/movimientos')
$ErrorActionPreference = 'Stop'
$script:pasos = 0
function Verificar($condicion, $mensaje) { if (!$condicion) { throw "FALLO: $mensaje" }; $script:pasos++; Write-Host "OK $script:pasos - $mensaje" }
function Soap($accion, $contenido = '') {
    $xml = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><'+$accion+' xmlns="http://tempuri.org/">'+$contenido+'</'+$accion+'></s:Body></s:Envelope>'
    [xml](Invoke-WebRequest -Uri $Soap -Method Post -ContentType 'text/xml; charset=utf-8' -Headers @{SOAPAction='"http://tempuri.org/IProductoService/'+$accion+'"'} -Body ([Text.Encoding]::UTF8.GetBytes($xml))).Content
}
function Valor($xml, $campo) { $xml.SelectSingleNode("//*[local-name()='$campo']").InnerText }
function Stock($id) { [int](Valor (Soap 'ObtenerProducto' "<id>$id</id>") 'Stock') }
function ErrorHttp($accion, $status, $mensaje) {
    try { & $accion; throw 'La solicitud fue aceptada incorrectamente' }
    catch { Verificar ([int]$_.Exception.Response.StatusCode -eq $status) $mensaje }
}
$marca = Get-Date -Format 'yyyyMMdd-HHmmss'
$catXml = '<categoria xmlns:d="http://schemas.datacontract.org/2004/07/HeladeriaSOAPA.Models"><d:Descripcion>Prueba de integración</d:Descripcion><d:Estado>true</d:Estado><d:IdCategoria>0</d:IdCategoria><d:Nombre>QA '+$marca+'</d:Nombre></categoria>'
$c = Soap 'AgregarCategoria' $catXml
$idCategoria = [int](Valor $c 'IdCategoria')
Verificar ($idCategoria -gt 0) 'SOAP crea categoría persistente'
$productoXml = '<producto xmlns:d="http://schemas.datacontract.org/2004/07/HeladeriaSOAPA.Models"><d:Descripcion>Prueba automática aislada de productos existentes</d:Descripcion><d:Estado>true</d:Estado><d:IdCategoria>'+$idCategoria+'</d:IdCategoria><d:IdProducto>0</d:IdProducto><d:Nombre>Helado QA '+$marca+'</d:Nombre><d:Precio>2.50</d:Precio><d:Stock>10</d:Stock></producto>'
$p = Soap 'AgregarProducto' $productoXml
$idProducto = [int](Valor $p 'IdProducto')
Verificar ((Stock $idProducto) -eq 10) 'SOAP consulta stock inicial de 10'
$actualizacion = $productoXml.Replace('<d:IdProducto>0</d:IdProducto>',"<d:IdProducto>$idProducto</d:IdProducto>").Replace('2.50','3.25')
Verificar ((Valor (Soap 'ActualizarProducto' $actualizacion) 'ActualizarProductoResult') -eq 'true') 'SOAP actualiza producto'
Verificar ((Valor (Soap 'ObtenerProducto' "<id>$idProducto</id>") 'Precio') -eq '3.25') 'SOAP conserva precio actualizado'
ErrorHttp { Soap 'EliminarCategoria' "<id>$idCategoria</id>" } 500 'SOAP impide desactivar categoría con producto activo'
$entrada = @{idProducto=$idProducto;tipoMovimiento='Entrada';cantidad=5;observacion='QA entrada'}
$m = Invoke-RestMethod -Uri $Rest -Method Post -ContentType 'application/json' -Body ($entrada | ConvertTo-Json)
Verificar ((Stock $idProducto) -eq 15) 'REST entrada suma 5 y SOAP observa 15'
$entrada.cantidad = 3
Invoke-RestMethod -Uri "$Rest/$($m.idMovimiento)" -Method Put -ContentType 'application/json' -Body ($entrada | ConvertTo-Json) | Out-Null
Verificar ((Stock $idProducto) -eq 13) 'REST editar revierte efecto previo y aplica 3'
$salida = @{idProducto=$idProducto;tipoMovimiento='Salida';cantidad=4;observacion='QA salida'}
$s = Invoke-RestMethod -Uri $Rest -Method Post -ContentType 'application/json' -Body ($salida | ConvertTo-Json)
Verificar ((Stock $idProducto) -eq 9) 'REST salida descuenta 4'
$salida.cantidad = 100
ErrorHttp { Invoke-RestMethod -Uri $Rest -Method Post -ContentType 'application/json' -Body ($salida | ConvertTo-Json) } 409 'REST rechaza stock insuficiente'
Verificar ((Stock $idProducto) -eq 9) 'Rechazo no altera stock'
$salida.cantidad = 0
ErrorHttp { Invoke-RestMethod -Uri $Rest -Method Post -ContentType 'application/json' -Body ($salida | ConvertTo-Json) } 400 'REST rechaza cantidad cero'
ErrorHttp { Invoke-RestMethod -Uri "$Rest/2147483647" } 404 'REST devuelve 404 para ID inexistente'
$lista = Invoke-RestMethod -Uri "${Rest}?idProducto=$idProducto"
Verificar (@($lista).Count -eq 2) 'REST filtra movimientos por producto'
Invoke-RestMethod -Uri "$Rest/$($s.idMovimiento)" -Method Delete | Out-Null
Verificar ((Stock $idProducto) -eq 13) 'REST eliminar salida restituye stock'
Invoke-RestMethod -Uri "$Rest/$($m.idMovimiento)" -Method Delete | Out-Null
Verificar ((Stock $idProducto) -eq 10) 'REST eliminar entrada restaura saldo original'
Soap 'EliminarProducto' "<id>$idProducto</id>" | Out-Null
Soap 'EliminarCategoria' "<id>$idCategoria</id>" | Out-Null
Verificar ((Valor (Soap 'ObtenerProducto' "<id>$idProducto</id>") 'Estado') -eq 'false') 'SOAP desactiva y conserva historial'
Write-Host "Resultado: $script:pasos verificaciones correctas. Registros QA $idCategoria/$idProducto conservados inactivos para trazabilidad."

