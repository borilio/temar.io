# Ejemplo de Markdown completo

¡Aquí tienes un pequeño “cóctel” con todo lo básico y avanzado que puedes usar en Markdown! Puedes copiar este trozo y probarlo donde quieras.

---

## 1. Encabezados

# Título principal
## Subtítulo
### Tercer nivel

---

## 2. Listas

- Fruta
    - Manzana
    - Naranja
- Verduras
    - Lechuga
    - Tomate

1. Primer paso
2. Segundo paso

---

## 3. Texto en negrita y cursiva

**Este texto está en negrita**

*Esto está en cursiva*

***Negrita y cursiva a la vez***

---

## 4. Citas

> Esto es una cita bonita estándar.  
> —Markdown Lover

> [!important]
>
> Cita de tipo important, con un trozo de código en línea. 
> Si ejecuta `npm install -g json-server` sin indicar la versión concreta, pero no tendrás la opción de retraso.

> [!note]
> Cita de tipo note

> [!tip]
> Cita de tipo tip

> [!warning]
> Cita de tipo warning

> [!caution]
> Cita de tipo warning


---

## 5. Enlaces y referencia rápida

Puedes visitar [Google](https://www.google.com) o hacer una referencia a [Section 1](#encabezados).

---

## 6. Imágenes

![Logo Markdown](https://markdown-here.com/img/icon256.png "Ejemplo de imagen")

---

## 7. Tablas

| Nombre    | Lenguaje favorito | Github           |
|-----------|------------------|------------------|
| Alice     | TypeScript       | [@alice123](https://github.com/alice123) |
| Bob       | Python           | [@bobdev](https://github.com/bobdev)     |
| Claudia   | Go               | [@godev](https://github.com/godev)       |

---

## 8. Código

Veamos bloques de código:

```typescript
function saluda(nombre: string): void {
    console.log(¡Hola, ${nombre}!);
}
```

```sql
SELECT * FROM clientes WHERE nombre='Pepe';
```

Y también veamos como se ve el código en línea, por ejemplo `System.out.println(“Hola Mundo!!!”);`. Se ve distinto que `int a=5;`.



---
## 9. Tareas/todo

- [x] Escribir ejemplo
- [ ] Probar en visor Markdown
- [ ] Compartir con amigos

---

## 10. Bloques personalizados con html y css

Bloques listos para usar en Markdown con HTML embebido, usando colores contextuales y texto con contraste adecuado.


<div style="padding: 1rem; background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 4px; color: #0b3e48; margin: 1rem 0;">
💡 <span style="font-weight: bold; color: #0b3e48;">Info:</span> Este es un bloque de tipo `info`. Puedes usarlo para lo que necesites.
</div>


<div style="padding: 1rem; background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px; color: #7b5e00; margin: 1rem 0;">
⚠️ <span style="font-weight: bold; color: #7b5e00;">Aviso:</span> Este es un bloque de tipo `warning`. Puedes usarlo para lo que necesites.
</div>

<div style="padding: 1rem; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; color: #721c24; margin: 1rem 0;">
🚨 <span style="font-weight: bold; color: #721c24;">Importante:</span> Este es un bloque de tipo `danger`. Puedes usarlo para lo que necesites.
</div>

<div style="padding: 1rem; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; color: #155724; margin: 1rem 0;">
✅ <span style="font-weight: bold; color: #155724;">Correcto:</span> Este es un bloque de tipo `success`. Puedes usarlo para lo que necesites.
</div>

<div style="padding: 1rem; background-color: #e2e3e5; border: 1px solid #d6d8db; border-radius: 4px; color: #2f3133; margin: 1rem 0;">
ℹ️ <span style="font-weight: bold; color: #2f3133;">Nota:</span> Este es un bloque de tipo `secondary`. Puedes usarlo para lo que necesites.
</div>

<div style="padding: 1rem; background-color: #fefefe; border: 1px solid #fdfdfe; border-radius: 4px; color: #818182; margin: 1rem 0;">
🌕 <span style="font-weight: bold; color: #818182;">Claro:</span> Este es un bloque de tipo `light`. Puedes usarlo para lo que necesites.
</div>

<div style="padding: 1rem; background-color: #d6d8d9; border: 1px solid #c6c8ca; border-radius: 4px; color: #1b1e21; margin: 1rem 0;">
🌑 <span style="font-weight: bold; color: #1b1e21;">Oscuro:</span> Este es un bloque de tipo `dark`. Puedes usarlo para lo que necesites.
</div>

<div style="padding: 1rem; background-color: #ede3f7; border: 1px solid #d6c3f1; border-radius: 4px; color: #5b2a86; margin: 1rem 0;">
🟣 <span style="font-weight: bold; color: #5b2a86;">Morado:</span> Este es un bloque de tipo `purple`. Puedes usarlo para lo que necesites.
</div>

He dejado solo los bloques divs, para comprobar como se renderiza un divs con css propio, y un ejemplo del código.

```html
<div style="padding: 1rem; background-color: #ede3f7; border: 1px solid #d6c3f1; border-radius: 4px; color: #5b2a86; margin: 1rem 0;">
🟣 <span style="font-weight: bold; color: #5b2a86;">Morado:</span> Este es un bloque de tipo `purple`. Puedes usarlo para lo que necesites.
</div>
```
