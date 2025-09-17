# GRUPO 19 - SEMINARIO DE SISTEMAS I

## Práctica 2 - SaborConecta

## 1. Integrantes del grupo 

| # | Nombre                                 | Carnet     |
|---|----------------------------------------|------------|
| 1 | Bismarck Estuardo Romero Lemus         | 201708880  |
| 2 | Naomi Rashel Yos Cujcuj                | 202001814  |
| 3 | Pedro Alejandro Zetino Páez            | 202004750  |
| 4 | Jonathan Josué Argueta Salazar         | 201700568  |
| 5 | Josué Nabí Hurtarte Pinto              | 202202481  |

## 2. Descripción del proyecto y arquitectura Usada

SaborConecta es una plataforma web que permite a los usuarios gestionar, compartir y descubrir recetas de cocina en la nube. El sistema facilita la creación de perfiles, la subida de imágenes, la organización de recetas por categorías y la interacción social mediante favoritos. Está diseñado para ser escalable y seguro, integrando servicios cloud y una base de datos relacional para almacenar la información de usuarios y recetas.

### Vista de home
![alt text](Assets/image.png)

### Vista de recetas
![alt text](Assets/image-1.png)

### Vista de recetas por categoría
![alt text](Assets/image-7.png)

### Vista de receta individual
![alt text](Assets/image-4.png)

### Vista de mis recetas
![alt text](Assets/image-2.png)

### Vista de crear receta
![alt text](Assets/image-3.png)

### Vista recetas favoritas
![alt text](Assets/image-5.png)

### Vista de perfil
![alt text](Assets/image-6.png)

### Arquitectura en la nube
![alt text](./Assets/arquitectura.png)

### Base de datos
![alt text](./server/Database/er_semi1-practica2.png)

## 3. Capturas de pantalla de los recursos

### 3.1 Base de datos
![alt text](./Assets/BD.jpg)

### 3.2 Blob Containers
![alt text](./Assets/blob.jpg)

### 3.3 Instancias de VM
![alt text](./Assets/VM1.jpg)

### 3.4 Load Balancer
![alt text](./Assets/LB.jpg)

### 3.5 Functions
![alt text](./Assets/functions.jpg)

### 3.6 API Management
![alt text](./Assets/APIMANAGEMENT.jpg)


## 4. Comparativa de proveedores de servicios en la nube

Al hacer una comparación entre los servicios de AWS y Azure, se nota una mayor complejidad en el lado de azure, siendo que este proveedor de servicios no es tan amigable con un nuevo usuario como AWS. 
Una de las mayores ventajasde Azure, es su fácil integración con los servicios de Microsoft.