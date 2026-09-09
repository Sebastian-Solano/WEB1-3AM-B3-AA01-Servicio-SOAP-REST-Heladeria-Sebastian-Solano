import json
from pathlib import Path
ns='http://schemas.datacontract.org/2004/07/HeladeriaSOAPA.Models'
items=[]
def checks(code=200, extra=[]):
    return [{'listen':'test','script':{'type':'text/javascript','exec':[f'pm.test("HTTP {code}", () => pm.response.to.have.status({code}));']+extra}}]
def soap(name,body='',extra=[],code=200):
    items.append({'name':'SOAP · '+name,'request':{'method':'POST','header':[{'key':'Content-Type','value':'text/xml; charset=utf-8'},{'key':'SOAPAction','value':f'"http://tempuri.org/IProductoService/{name}"'}],'url':'{{soapUrl}}','body':{'mode':'raw','raw':f'<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><{name} xmlns="http://tempuri.org/">{body}</{name}></s:Body></s:Envelope>','options':{'raw':{'language':'xml'}}}},'event':checks(code,extra)})
def entidad(tipo,data):
    return f'<{tipo.lower()} xmlns:d="{ns}">'+''.join(f'<d:{k}>{v}</d:{k}>' for k,v in sorted(data.items()))+f'</{tipo.lower()}>'
def guardar_id(campo,var):
    return [f'const m = pm.response.text().match(/<(?:[\\w]+:)?{campo}>(\\d+)<\\//);',f'pm.test("Identificador generado", () => pm.expect(m).not.to.be.null); if(m) pm.collectionVariables.set("{var}",m[1]);']
def rest(name,method,path='',body=None,code=200,extra=[]):
    req={'method':method,'header':[],'url':'{{restUrl}}'+path}
    if body is not None:
        req['header']=[{'key':'Content-Type','value':'application/json'}]
        req['body']={'mode':'raw','raw':json.dumps(body,ensure_ascii=False).replace('"{{productoId}}"','{{productoId}}'),'options':{'raw':{'language':'json'}}}
    items.append({'name':'REST · '+name,'request':req,'event':checks(code,extra)})
soap('ObtenerCategorias')
cat={'Descripcion':'Prueba Postman AA','Estado':'true','IdCategoria':0,'Nombre':'Categoría Postman {{$timestamp}}'}
soap('AgregarCategoria',entidad('Categoria',cat),guardar_id('IdCategoria','categoriaId'))
cat.update(IdCategoria='{{categoriaId}}',Nombre='Categoría Postman actualizada')
soap('ActualizarCategoria',entidad('Categoria',cat))
p={'Descripcion':'Producto de prueba Postman','Estado':'true','IdCategoria':'{{categoriaId}}','IdProducto':0,'Nombre':'Helado Postman {{$timestamp}}','Precio':'2.50','Stock':10}
soap('AgregarProducto',entidad('Producto',p),guardar_id('IdProducto','productoId'))
soap('ObtenerProductos')
soap('ObtenerProducto','<id>{{productoId}}</id>')
p.update(IdProducto='{{productoId}}',Precio='3.25')
soap('ActualizarProducto',entidad('Producto',p))
soap('ObtenerProductosPorCategoria','<idCategoria>{{categoriaId}}</idCategoria>')
soap('ObtenerProductosPorPrecio','<precioMinimo>1</precioMinimo><precioMaximo>5</precioMaximo>')
m={'idProducto':'{{productoId}}','tipoMovimiento':'Entrada','cantidad':5,'observacion':'Compra de prueba'}
rest('Registrar entrada','POST',body=m,code=201,extra=['pm.collectionVariables.set("movimientoId",pm.response.json().idMovimiento);'])
rest('Listar por producto','GET','?idProducto={{productoId}}')
rest('Consultar movimiento','GET','/{{movimientoId}}')
m['cantidad']=3
rest('Actualizar entrada','PUT','/{{movimientoId}}',m)
soap('ObtenerProducto','<id>{{productoId}}</id>', ['pm.test("Stock 13 tras editar entrada", () => pm.expect(pm.response.text()).to.match(/Stock>13<\//));'])
m.update(tipoMovimiento='Salida',cantidad=99999)
rest('Rechazar salida sin stock','POST',body=m,code=409)
m['cantidad']=0
rest('Rechazar cantidad cero','POST',body=m,code=400)
rest('Eliminar y revertir entrada','DELETE','/{{movimientoId}}',code=204)
soap('ObtenerProducto','<id>{{productoId}}</id>', ['pm.test("Stock inicial restaurado", () => pm.expect(pm.response.text()).to.match(/Stock>10<\//));'])
soap('EliminarProducto','<id>{{productoId}}</id>')
soap('EliminarCategoria','<id>{{categoriaId}}</id>')
items.append({'name':'API externa · Catálogo de alimentos','request':{'method':'GET','url':'https://dummyjson.com/products/category/groceries'},'event':checks(200,['pm.test("Catálogo recibido", () => pm.expect(pm.response.json().products).to.be.an("array"));'])})
collection={'info':{'name':'Heladería SOAPA · AA SOAP REST y API externa','description':'Ejecutar en orden con Collection Runner. Crea registros propios, prueba CRUD y stock, y termina desactivándolos. No altera productos previos. Importar con ambos servicios en ejecución.','schema':'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'},'variable':[{'key':'soapUrl','value':'http://localhost:5102/ProductoService.asmx'},{'key':'restUrl','value':'http://localhost:5103/api/movimientos'},{'key':'categoriaId','value':''},{'key':'productoId','value':''},{'key':'movimientoId','value':''}],'item':items}
Path('POSTMAN/Heladeria-AA.postman_collection.json').write_text(json.dumps(collection,ensure_ascii=False,indent=2),encoding='utf-8')
