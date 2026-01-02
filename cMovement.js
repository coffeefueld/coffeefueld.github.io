let cam = document.getElementById('camera');


document.body.addEventListener('keydown', (e) => {

    let posOffset = 1;
    let prevCamPos;

    prevCamPos = cam.getAttribute('position');

    if (e.key === "q") {
        cam.setAttribute('position', String(prevCamPos.x) + ' ' +String(prevCamPos.y+posOffset) + ' ' + String(prevCamPos.z) );
    }
    if (e.key === "e") {
        cam.setAttribute('position', String(prevCamPos.x) + ' ' +String(prevCamPos.y-posOffset) + ' ' + String(prevCamPos.z) );
    }
    if (e.shiftKey) {
        cam.setAttribute('wasd-controls', 'acceleration: 500');
    }
});

document.body.addEventListener('keyup', (e) => {
    if (!e.shiftKey) {
        cam.setAttribute('wasd-controls', 'acceleration: 100');
    }
})