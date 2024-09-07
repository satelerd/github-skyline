# GitHub Skyline Revived

Inspirado en [Github Skyline](https://skyline.github.com) (2021, descontinuado)

Este repo es un fork de un fork de un fork de un fork de un fork del "original" replicado por [github.com/jasonlong](https://github.com/jasonlong)...


## Características

- Utiliza la API GraphQL de GitHub para datos actualizados

- Renderiza contribuciones de GitHub como un skyline en 3D

- Exporta como STL para impresión 3D

## Uso

1. Clona el repo

2. Ejecuta un servidor local:
   ```
   python -m http.server 8000
   ```

3. Navega a:
   ```
   http://localhost:8000/?username=<github_user>&year=<YYYY>
   ```
   Reemplaza `<github_user>` y `<YYYY>`. Ejemplo:
   ```
   ?username=satelerd&year=2021
   ```