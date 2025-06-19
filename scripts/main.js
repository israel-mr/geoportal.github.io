// Inicializar el mapa cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el mapa en el contenedor 'map'
    const map = L.map('map').setView([19.4326, -99.1332], 12); // Ciudad de México
// Función para manejar el colapso del navbar
    const navbar = document.getElementById('navbar');
    const toggleNav = document.querySelector('.toggle-nav');

    // Recuperar el estado del navbar del localStorage
    const isCollapsed = localStorage.getItem('navbarCollapsed') === 'true';
    if (isCollapsed) {
        navbar.classList.add('collapsed');
    }

    toggleNav.addEventListener('click', function() {
        navbar.classList.toggle('collapsed');
        // Guardar el estado en localStorage
        localStorage.setItem('navbarCollapsed', navbar.classList.contains('collapsed'));
    });


    // Añadir capa base Voyager de CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 5
    }).addTo(map);

    // Añadir marcador de ejemplo
    L.marker([19.4326, -99.1332]).addTo(map)
        .bindPopup('Ciudad de México<br>Capital del país.')
        .openPopup();

    // Actualizar coordenadas al mover el mapa
    function updateCoordinates(e) {
        if (e) {
            document.getElementById('latitude').textContent = e.latlng.lat.toFixed(4);
            document.getElementById('longitude').textContent = e.latlng.lng.toFixed(4);
        }
    }

    map.on('mousemove', updateCoordinates);

    // Actualizar nivel de zoom
    map.on('zoomend', function() {
        document.getElementById('zoom-level').textContent = map.getZoom();
    });

    // Actualizar coordenadas iniciales
    updateCoordinates({latlng: map.getCenter()});

    // Manejar los clics en los enlaces del navbar
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remover clase active de todos los ítems del nav
            navItems.forEach(i => i.classList.remove('active'));

            // Añadir clase active al ítem actual
            this.classList.add('active');

            // Obtener el target
            const targetId = this.getAttribute('data-target');

            // Ocultar todas las secciones
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });

            // Mostrar la sección seleccionada
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Simular logo SVG
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
        logoContainer.innerHTML = `
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#27ae60"/>
            </svg>
        `;
    }

    // Configuración del panel de capas
    const layersPanel = document.querySelector('.layers-panel');
    const minimizeBtn = document.getElementById('minimizePanel');
    const closeBtn = document.getElementById('closePanel');
    const baseLayerCheckbox = document.getElementById('baseLayer');
    const markersLayerCheckbox = document.getElementById('markersLayer');

// Hacer el panel arrastrable
    layersPanel.addEventListener('mousedown', function(e) {
        if (e.target.closest('.layers-header')) {
            let isDragging = true;
            const panel = this;
            const startX = e.clientX - panel.offsetLeft;
            const startY = e.clientY - panel.offsetTop;

            function movePanel(e) {
                if (isDragging) {
                    panel.style.left = `${e.clientX - startX}px`;
                    panel.style.top = `${e.clientY - startY}px`;
                }
            }

            function stopDragging() {
                isDragging = false;
                document.removeEventListener('mousemove', movePanel);
                document.removeEventListener('mouseup', stopDragging);
            }

            document.addEventListener('mousemove', movePanel);
            document.addEventListener('mouseup', stopDragging);
        }
    });

// Minimizar panel
    minimizeBtn.addEventListener('click', () => {
        layersPanel.classList.toggle('minimized');
        minimizeBtn.innerHTML = layersPanel.classList.contains('minimized') ?
            '<i class="fas fa-plus"></i>' :
            '<i class="fas fa-minus"></i>';
    });

// Cerrar panel
    closeBtn.addEventListener('click', () => {
        layersPanel.style.display = 'none';
    });

// Control de capas
    baseLayerCheckbox.addEventListener('change', function() {
        if (this.checked) {
            map.addLayer(baseLayer);
        } else {
            map.removeLayer(baseLayer);
        }
    });

    markersLayerCheckbox.addEventListener('change', function() {
        if (this.checked) {
            marker.addTo(map);
        } else {
            marker.remove();
        }
    });

// Mostrar panel al hacer clic en el botón de capas
    document.querySelector('button[class="btn btn-outline-success"]').addEventListener('click', () => {
        layersPanel.style.display = 'block';
    });


// Inicializar las herramientas de dibujo


    // Añade esto después de la inicialización del mapa

// Inicializar grupo de elementos dibujados
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

// Configurar las opciones de dibujo
    const drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#27ae60',
                    weight: 3
                }
            },
            polygon: {
                allowIntersection: false,
                drawError: {
                    color: '#e74c3c',
                    timeout: 1000
                },
                shapeOptions: {
                    color: '#27ae60'
                },
                showArea: true
            },
            circle: false,
            circlemarker: false,
            rectangle: {
                shapeOptions: {
                    color: '#27ae60'
                }
            },
            marker: true
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });

// Añadir herramienta de medición
    const measureControl = new L.Control.Measure({
        position: 'topleft',
        primaryLengthUnit: 'meters',
        secondaryLengthUnit: 'kilometers',
        primaryAreaUnit: 'sqmeters',
        secondaryAreaUnit: 'hectares',
        activeColor: '#27ae60',
        completedColor: '#27ae60'
    });

// Variables de control
    let currentDrawControl = null;
    let isEditing = false;

// Funciones de los botones
    document.getElementById('drawMarker').addEventListener('click', () => {
        disableAllControls();
        new L.Draw.Marker(map).enable();
    });

    document.getElementById('drawPolygon').addEventListener('click', () => {
        disableAllControls();
        new L.Draw.Polygon(map).enable();
    });

    document.getElementById('drawPolyline').addEventListener('click', () => {
        disableAllControls();
        new L.Draw.Polyline(map).enable();
    });

    document.getElementById('drawRectangle').addEventListener('click', () => {
        disableAllControls();
        new L.Draw.Rectangle(map).enable();
    });

    document.getElementById('editFeatures').addEventListener('click', () => {
        disableAllControls();
        if (!isEditing) {
            new L.EditToolbar.Edit(map, {
                featureGroup: drawnItems
            }).enable();
            isEditing = true;
        }
    });

    document.getElementById('deleteFeatures').addEventListener('click', () => {
        drawnItems.clearLayers();
    });

    document.getElementById('measureDistance').addEventListener('click', () => {
        disableAllControls();
        measureControl.addTo(map);
        measureControl._measureHandler.enable();
    });

    document.getElementById('measureArea').addEventListener('click', () => {
        disableAllControls();
        measureControl.addTo(map);
        measureControl._measureHandler.enable();
    });

    document.getElementById('exportGeoJSON').addEventListener('click', () => {
        const data = drawnItems.toGeoJSON();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'elementos_dibujados.geojson';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

// Función para deshabilitar todos los controles activos
    function disableAllControls() {
        if (currentDrawControl) {
            currentDrawControl.disable();
        }
        if (isEditing) {
            map.editTools.stopDrawing();
            isEditing = false;
        }
        if (measureControl) {
            measureControl._measureHandler.disable();
        }
    }

// Eventos del mapa
    map.on('draw:created', function(e) {
        drawnItems.addLayer(e.layer);
    });

    map.on('draw:edited', function(e) {
        isEditing = false;
    });

// Manejo del panel de herramientas
    const toolsPanel = document.querySelector('.tools-panel');
    const minimizeToolsBtn = document.getElementById('minimizeToolsPanel');
    const closeToolsBtn = document.getElementById('closeToolsPanel');

    minimizeToolsBtn.addEventListener('click', () => {
        toolsPanel.classList.toggle('minimized');
        minimizeToolsBtn.innerHTML = toolsPanel.classList.contains('minimized') ?
            '<i class="fas fa-plus"></i>' :
            '<i class="fas fa-minus"></i>';
    });

    closeToolsBtn.addEventListener('click', () => {
        toolsPanel.style.display = 'none';
    });

// Hacer el panel arrastrable
    toolsPanel.addEventListener('mousedown', function(e) {
        if (e.target.closest('.tools-header')) {
            let isDragging = true;
            const panel = this;
            const startX = e.clientX - panel.offsetLeft;
            const startY = e.clientY - panel.offsetTop;

            function movePanel(e) {
                if (isDragging) {
                    panel.style.left = `${e.clientX - startX}px`;
                    panel.style.top = `${e.clientY - startY}px`;
                }
            }

            function stopDragging() {
                isDragging = false;
                document.removeEventListener('mousemove', movePanel);
                document.removeEventListener('mouseup', stopDragging);
            }

            document.addEventListener('mousemove', movePanel);
            document.addEventListener('mouseup', stopDragging);
        }
    });


});