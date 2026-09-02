CREATE TABLE Categoria
(
    IdCategoria INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(250) NULL,
    Estado BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_Categoria
        PRIMARY KEY (IdCategoria)
);
GO


CREATE TABLE Producto
(
    IdProducto INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(250) NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL,
    Estado BIT NOT NULL DEFAULT 1,
    IdCategoria INT NOT NULL,
    CONSTRAINT PK_Producto
        PRIMARY KEY (IdProducto),
    CONSTRAINT FK_Producto_Categoria
        FOREIGN KEY (IdCategoria)
        REFERENCES Categoria(IdCategoria)
);
GO

select * from Producto;
Select * from Categoria;

INSERT INTO Categoria(Nombre,Descripcion,Estado)
VALUES('Helados','Helados de diferentes sabores y presentaciones',1);

INSERT INTO Categoria(Nombre,Descripcion,Estado)
VALUES('Bebidas','Bebidas frías para acompañar los helados',1);

INSERT INTO Categoria(Nombre,Descripcion,Estado)
VALUES('Postres','Postres y complementos de la heladería',1);

INSERT INTO Producto(Nombre,Descripcion,Precio,Stock,Estado,IdCategoria)
VALUES('Helado de Chocolate','Helado cremoso sabor chocolate',2.50,30,1,1);

INSERT INTO Producto(Nombre,Descripcion,Precio,Stock,Estado,IdCategoria)
VALUES('Helado de Vainilla','Helado cremoso sabor vainilla',2.50,25,1,1);

INSERT INTO Producto(Nombre,Descripcion,Precio,Stock,Estado,IdCategoria)
VALUES('Helado de Fresa','Helado cremoso sabor fresa',2.75,20,1,1);

INSERT INTO Producto(Nombre,Descripcion,Precio,Stock,Estado,IdCategoria)
VALUES('Batido de Chocolate','Batido frío preparado con helado de chocolate',3.50,18,1,2);

INSERT INTO Producto(Nombre,Descripcion,Precio,Stock,Estado,IdCategoria)
VALUES('Limonada','Limonada fría natural',1.75,20,1,2);

INSERT INTO Producto(Nombre,Descripcion,Precio,Stock,Estado,IdCategoria)
VALUES('Brownie con Helado','Brownie de chocolate acompañado de una bola de helado',4.50,15,1,3);

INSERT INTO Producto(Nombre,Descripcion,Precio,Stock,Estado,IdCategoria)
VALUES('Banana Split','Banano acompañado de helado, crema y salsa de chocolate',5.00,12,1,3);
GO