const canvas = document.getElementById('canvas');
canvas.width = 500;
canvas.height = 400;
canvas.style.backgroundColor = '#dedede';

const context = canvas.getContext('2d');
const DOT_RADIUS = 5.5; //radius of red dots

let points = [];

let equalArea; //area of each figures (paralellogram and circle have equal areas)
let ab; //length of first parallelogram 'AB' side (built between first two user's points)
let bc; //length of 'BC', adjacent side to 'AB' (built between 2-nd and 3-rd user's points)
let d1; //length of first parallelogram's diagonal or 'AC' line (built between 1-st and 3-rd user's points)
let thp; //half perimeter of 'ABC' triangle (this triangle is an exact half of parallelogram)
let center = {
    posX: 0,
    posY: 0
}; //common center point for two figures

let r; //radius of circle
let needsMoreDots = true;

//offsets relative to the zero point of the viewport
const hitboxOffset = 9//allowable deviation between hitbox registration and red dot center.
const rect = canvas.getBoundingClientRect();
const offsetX = rect.left + window.scrollX + hitboxOffset;
const offsetY = rect.top + window.scrollY + hitboxOffset;

let mouse = {
    posX: 0,
    posY: 0,
    down: false
};

const Point = function (x, y) {
    this.posX = x;
    this.posY = y;
    this.isSelected = false;
    this.opposite = 0;
};

function makeRoundShape(x, y, color, radius, shapeType) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    if (shapeType == 'circle') {
        context.strokeStyle = color;
        context.stroke();
    } else {
        context.fillStyle = color;
        context.fill();
    }
};

function setPoint(e) {
    if (!needsMoreDots) return;
    makeRoundShape(e.clientX - offsetX, e.clientY - offsetY, 'red', DOT_RADIUS, 'dot');
    let point = new Point(e.clientX - offsetX, e.clientY - offsetY)
    points.push(point);
    if (points.length != 3) return;

    findFourthPoint(points);
    points[0].opposite = 2;
    points[1].opposite = 3;
    points[2].opposite = 0;
    points[3].opposite = 1;
    calcParameters(points);
    buildFigure(points, r, center);
};

function findFourthPoint(arr) {
    arr.push(new Point((arr[2].posX + (arr[0].posX - arr[1].posX)), (arr[2].posY + (arr[0].posY - arr[1].posY))));
    //finding the x and y coordinates of 4-th point ('D') in 'ABCD' parallelogram
};

function showParameters(dots, area) {
    let a = document.getElementById('A');
    let b = document.getElementById('B');
    let c = document.getElementById('C');
    let d = document.getElementById('D');
    let ps = document.getElementById('PS');
    let cs = document.getElementById('CS');

    // Limiting the shown numbers to three digits after the comma
    const limitDecimalPlaces = num => parseFloat(num).toFixed(0);

    a.value = limitDecimalPlaces(dots[0].posX) || 'in process';
    b.value = limitDecimalPlaces(dots[1].posX) || 'in process';
    c.value = limitDecimalPlaces(dots[2].posX) || 'in process';
    d.value = limitDecimalPlaces(dots[3].posX) || 'in process';
    ps.value = limitDecimalPlaces(area) || 'in process';
    cs.value = limitDecimalPlaces(area) || 'in process';
};

document.getElementById("about_b").onclick = function () {
    let about = document.getElementById('about');
    about.classList.remove('hidden');
    about.classList.add('visible');
};

document.getElementById("reset_b").onclick = function () {
    location.reload();
};

function calcParameters(dots) {
    //get parallelogram diagonal's length by using the formula of calculating the distance between two points
    d1 = Math.sqrt(Math.pow((dots[2].posX - dots[0].posX), 2) + Math.pow((dots[2].posY - dots[0].posY), 2));

    //get the length of 'AB' side
    ab = Math.sqrt(Math.pow((dots[1].posX - dots[0].posX), 2) + Math.pow((dots[1].posY - dots[0].posY), 2));

    //get the length of 'BC' side
    bc = Math.sqrt(Math.pow((dots[2].posX - dots[1].posX), 2) + Math.pow((dots[2].posY - dots[1].posY), 2));

    //get the 'ABC' Triangle Half Perimeter
    thp = (d1 + ab + bc) / 2;

    //applying Heron's formula to find the area of 'ABC' triangle
    //and finding the area of circle and 'ABCD' parallelogram by multiplying 'ABC' triangle area by two
    equalArea = Math.sqrt(thp * (thp - d1) * (thp - ab) * (thp - bc)) * 2; 

    r = Math.sqrt(equalArea / Math.PI);

    center.posX = (dots[0].posX + dots[2].posX) / 2;
    center.posY = (dots[0].posY + dots[2].posY) / 2;
};

function buildFigure(dots, circleRadius, center) {
    buildPoints(dots);
    needsMoreDots = false;

    context.beginPath();
    context.strokeStyle = 'blue';
    context.lineWidth = '3';
    context.moveTo(dots[0].posX, dots[0].posY);
    for (i = 1; i < 4; i++) {
        context.lineTo(dots[i].posX, dots[i].posY);
        context.stroke();
    }
    context.lineTo(dots[0].posX, dots[0].posY);
    context.stroke();

    makeRoundShape(center.posX, center.posY, 'yellow', circleRadius, 'circle');
    showParameters(points, equalArea);
};

function buildPoints(dots) {
    for (let i = 0; i < dots.length; i++) {
        if (dots[i].isSelected) { makeRoundShape(dots[i].posX, dots[i].posY, 'green', DOT_RADIUS, 'dot'); }
        makeRoundShape(dots[i].posX, dots[i].posY, 'red', DOT_RADIUS, 'dot');
    }
};

function isCursorInDot(x, y, dot, dotRadius) {
    return x > dot.posX - dotRadius && x < dot.posX + dotRadius && y > dot.posY - dotRadius && y < dot.posY + dotRadius;
};

//set new coordinates to selected point and it's opposite one
function makeNewCoord(selectedPoint, mousePosition) {
    let dx = selectedPoint.posX - mousePosition.posX;
    let dy = selectedPoint.posY - mousePosition.posY;
    selectedPoint.posX = mousePosition.posX;
    selectedPoint.posY = mousePosition.posY;
    let op = selectedPoint.opposite;
    points[op].posX = points[op].posX + dx;
    points[op].posY = points[op].posY + dy;
};

function movePoint(e) {
    if (needsMoreDots) return;

    mouse.posX = e.clientX - offsetX;
    mouse.posY = e.clientY - offsetY;

    for (let j = 0; j < points.length; j++) {
        if (points[j].isSelected)
            makeNewCoord(points[j], mouse);
        showParameters(points, equalArea);
        context.clearRect(0, 0, canvas.width, canvas.height);
        calcParameters(points);
        buildFigure(points, r, center);
    }
};

function selectPoint(e) {
    if (needsMoreDots) return;

    let mx = e.clientX - offsetX;
    let my = e.clientY - offsetY;

    for (let i = 0; i < points.length; i++) {
        if (isCursorInDot(mx, my, points[i], DOT_RADIUS)) {
            points[i].isSelected = true;
        }
    }
    for (let i = 0; i < points.length; i++) {
        if (points[i].isSelected) {
            makeRoundShape(points[i].posX, points[i].posY, 'green', DOT_RADIUS, 'dot');
        }
    }
};

//set dots attributes to it's defaults
function refresh() {
    if (needsMoreDots) return;
    for (let i = 0; i < points.length; i++) {
        points[i].isSelected = false;
        makeRoundShape(points[i].posX, points[i].posY, 'red', DOT_RADIUS, 'dot');
    }
};

canvas.addEventListener('mousemove', movePoint)
canvas.addEventListener('click', setPoint);
canvas.addEventListener('mousedown', selectPoint);
canvas.addEventListener('mouseup', refresh);  