const canvas = document.getElementById('canvas'); 
canvas.width = 500;
canvas.height = 400;
canvas.style.backgroundColor = '#dedede';

const context = canvas.getContext('2d'); 
const dotRadius = 5.5; //radius of red dots

let points = [];
let point;
let s; //area of both figures ('ABCD' paralellogram and circle)
let ab; //length of first parallelogram 'AB' side (built of first two user's points)
let bc; //length of 'BC', adjacent side to 'AB' (built of 2-nd and 3-rd user's points)
let d1; //length of first parallelogram's diagonal or 'AC' line (built of 1-st and 3-rd user's points)
let thp; //half perimeter of 'ABC' triangle (this triangle is an exactly half of parallelogram)
let center = {
            posX: 0,
            posY: 0
            }; //object with x and y ccordinates of midpoint of d1 (which is also a center of circle)

let r; //radius of circle
let paint = true;

// Flag to indicate if dragging is in progress
let dragging = false;
// Selected point during dragging
let selectedPoint;

//offsets relative to the zero point of the viewport
const hitboxOffset = 9//difference between hitbox registration and red dot center.
//I'm not sure what exactly affects the value of this variable, 
//so I just temporary hardcoded '9' because it works
const rect = canvas.getBoundingClientRect();
const offsetX = rect.left + window.scrollX + hitboxOffset;
const offsetY = rect.top + window.scrollY + hitboxOffset;

let mouse = {
    posX: 0,
    posY: 0,
    down: false
};

const Point = function(x,y){
    this.posX = x;
    this.posY = y;
    this.isSelected = false;

    this.contr = 0;//array index of opposite point;
};

function makePointColored(x,y,color){
    context.beginPath();
    context.arc(x, y, 5.5, 0, Math.PI * 2);
    context.fillStyle = color ;
    context.fill(); 
};

function buildCircle(cx,cy,radius, color){
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.strokeStyle = color;
    context.stroke();
};

function setPoint(e){

    if(!paint)return;
    makePointColored(e.clientX-offsetX, e.clientY-offsetY,'red');
    point = new Point (e.clientX-offsetX, e.clientY-offsetY)
    points.push(point);
    if(points.length!=3) return;
    
    findFourthPoint(points);
    points[0].contr=2;
    points[1].contr=3;
    points[2].contr=0;
    points[3].contr=1;       
    calcParameters(points);
    buildFigure(points,r,center);
    
};

function findFourthPoint(arr){
    arr.push( new Point( (arr[2].posX+(arr[0].posX-arr[1].posX)),(arr[2].posY + (arr[0].posY - arr[1].posY)) ) );
    //finding of x and y coordinates of 4-th point 'D' of 'ABCD' parallelogram
};

function showParameters(dots, area){
    let a = document.getElementById('A');
    let b = document.getElementById('B');
    let c = document.getElementById('C');
    let d = document.getElementById('D');
    let ps = document.getElementById('PS');
    let cs = document.getElementById('CS');

    // Limiting the numbers to three digits after the comma
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


function calcParameters (dots){ 
    d1 = Math.sqrt( Math.pow((dots[2].posX-dots[0].posX),2) + Math.pow((dots[2].posY-dots[0].posY),2) );

    ab = Math.sqrt( Math.pow((dots[1].posX-dots[0].posX),2) + Math.pow((dots[1].posY-dots[0].posY),2) );

    bc = Math.sqrt( Math.pow((dots[2].posX-dots[1].posX),2) + Math.pow((dots[2].posY-dots[1].posY),2) );
    
    thp = (d1 + ab + bc)/2;

    //applying formula of Heron to find the area of 'ABC' triangle
    s = Math.sqrt(thp* (thp-d1) * (thp-ab) * (thp-bc)) * 2; //finding the area of circle and 'ABCD' parallelogram
    //by multiplying 'ABC' triangle area by two

    r = Math.sqrt(s/Math.PI);

    center.posX=(dots[0].posX+dots[2].posX)/2;
    center.posY=(dots[0].posY+dots[2].posY)/2;
};

function buildFigure (dots, rad, center){          
    buildPoints (dots);
    paint = false;

    context.beginPath();
    context.strokeStyle = 'blue';
    context.lineWidth = '3';
    context.moveTo(dots[0].posX, dots[0].posY);
    for (i=1; i<4; i++){
        context.lineTo(dots[i].posX, dots[i].posY);
        context.stroke();
    }
    context.lineTo(dots[0].posX, dots[0].posY);
    context.stroke();
    
    buildCircle(center.posX, center.posY, rad, 'yellow');
    showParameters(points, s);
};

function buildPoints (dots){
    for(let i=0; i <dots.length; i++){
        if(dots[i].isSelected) {makePointColored(dots[i].posX, dots[i].posY,'green');}
        makePointColored(dots[i].posX, dots[i].posY,'red');
    }
};

function isCursorInDot(x,y,dot){
    return x > dot.posX - 5.5 && x < dot.posX + 5.5 && y > dot.posY - 5.5 && y < dot.posY + 5.5;
};

//set new coordinates to selected point and it's opposite one
function makeNewCoord(selectedPoint, mousePosition){
    let dx = selectedPoint.posX-mousePosition.posX;
    let dy = selectedPoint.posY-mousePosition.posY;
    selectedPoint.posX=mousePosition.posX;
    selectedPoint.posY=mousePosition.posY;
    let op = selectedPoint.contr;
    points[op].posX = points[op].posX+dx;
    points[op].posY = points[op].posY+dy;
};

function movePoint(e){
    if(paint)return;
        
    mouse.posX = e.clientX - offsetX;
    mouse.posY = e.clientY - offsetY;

    for (let j = 0; j < points.length; j++) {
        if(points[j].isSelected) 
        makeNewCoord(points[j],mouse);
        showParameters(points, s);
        context.clearRect(0, 0, canvas.width, canvas.height);  
        calcParameters(points);
        buildFigure(points,r,center);
    }
};

function selectPoint(e){
    if(paint) return;

    let mx = e.clientX - offsetX;
    let my = e.clientY - offsetY;

    for (let i = 0; i<points.length; i++){
        if(isCursorInDot(mx, my, points[i])){
            points[i].isSelected=true;
        }     
    }
    for (let i = 0; i<points.length; i++){
        if(points[i].isSelected){
            makePointColored(points[i].posX, points[i].posY,'green');
        }
    }
};

//set dots attributes to 'defaults'
function refresh(){
    if(paint)return;
    for (let i = 0; i<points.length; i++){
        points[i].isSelected=false;
        makePointColored(points[i].posX, points[i].posY, 'red');
    }
};

canvas.addEventListener('mousemove', movePoint)
canvas.addEventListener('click', setPoint);
canvas.addEventListener('mousedown', selectPoint);
canvas.addEventListener('mouseup', refresh);  