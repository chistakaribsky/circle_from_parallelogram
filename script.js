        var canv = document.getElementById('canvas'); 
        var ctx = canvas.getContext('2d'); 
        canv.width = 500;
        canv.height = 400;
        canv.style.backgroundColor = '#dedede';

        var points = [];
        var point;
        var s; //area of both figures ('ABCD' paralellogram and circle)
        var ab; //length of first parallelogram 'AB' side (built of first two user's points)
        var bc; //length of 'BC', adjacent side to 'AB' (built of 2-nd and 3-rd user's points)
        var d1; //length of first parallelogram's diagonal or 'AC' line (built of 1-st and 3-rd user's points)
        var thp; //half perimeter of 'ABC' triangle (this triangle is an exactly half of parallelogram)
        var cntr = {
                    xpos: 0,
                    ypos: 0
                    }; //object with x  and y ccordinates of midpoint of d1 (which is also a center of circle)
        var dr = 5.5; //radius of red dots
        var r; //radius of circle
        var paint = true;

        // Flag to indicate if dragging is in progress
        var dragging = false;
        // Selected point during dragging
        var selectedPoint;
        
        var mouse = {
            xpos: 0,
            ypos: 0,
            down: false
        };

        var Point = function(x,y){
            this.xpos = x;
            this.ypos = y;
            this.isSelected = false;

            this.contr = 0;//array index of opposite point;
        };

        function makePointColored(x,y,color){
            ctx.beginPath();
            ctx.arc(x, y, 5.5, 0, Math.PI * 2);
            ctx.fillStyle = color ;
            ctx.fill(); 
        };

        function buildCircle(cx,cy,radius, color){
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.stroke();
        };

        function setPoint(e){

            if(!paint)return;
            makePointColored(e.clientX, e.clientY,'red');
            point = new Point (e.clientX, e.clientY)
            points.push(point);
            if(points.length!=3) return;
          
            findFourthPoint(points);
            points[0].contr=2;
            points[1].contr=3;
            points[2].contr=0;
            points[3].contr=1;       
            calcParameters(points);
            buildFigure(points,r,cntr);
          
        };

        function findFourthPoint(arr){
            arr.push( new Point( (arr[2].xpos+(arr[0].xpos-arr[1].xpos)),(arr[2].ypos + (arr[0].ypos - arr[1].ypos)) ) );
            //finding of x and y coordinates of 4-th point 'D' of 'ABCD' parallelogram
        };

        function showParameters(dots, area){
            var a = document.getElementById('A');
            var b = document.getElementById('B');
            var c = document.getElementById('C');
            var d = document.getElementById('D');
            var ps = document.getElementById('PS');
            var cs = document.getElementById('CS');
    
            a.value = dots[0].xpos||'in process';
            b.value = dots[1].xpos||'in process';
            c.value = dots[2].xpos||'in process';
            d.value = dots[3].xpos||'in process';
            ps.value = s||'in process';
            cs.value = s||'in process';
        }
        
        document.getElementById("about_b").onclick = function () {
            var about = document.getElementById('about');
            about.classList.remove('hidden');
            about.classList.add('visible');
        } 

        document.getElementById("reset_b").onclick = function () {
            // ctx.clearRect(0, 0, canv.width, canv.height);
            location.reload();
            // showParameters(points, s);
        } 
        

        function calcParameters (dots){ 
            d1 = Math.sqrt( Math.pow((dots[2].xpos-dots[0].xpos),2) + Math.pow((dots[2].ypos-dots[0].ypos),2) );
            // d1 = Math.sqrt( Math.pow((coord_X[2]-coord_X[0]),2) + Math.pow((coord_Y[2]-coord_Y[0]),2) );

            ab = Math.sqrt( Math.pow((dots[1].xpos-dots[0].xpos),2) + Math.pow((dots[1].ypos-dots[0].ypos),2) );

            bc = Math.sqrt( Math.pow((dots[2].xpos-dots[1].xpos),2) + Math.pow((dots[2].ypos-dots[1].ypos),2) );
            // bc = Math.sqrt( Math.pow((coord_X[2]-coord_X[1]),2) + Math.pow((coord_Y[2]-coord_Y[1]),2) );
            
            thp = (d1 + ab + bc)/2;

            //applying formula of Heron to find the area of 'ABC' triangle
            s = Math.sqrt(thp* (thp-d1) * (thp-ab) * (thp-bc)) * 2; //finding the area of circle and 'ABCD' parallelogram
            //by multiplying 'ABC' triangle area by two

            r = Math.sqrt(s/Math.PI);

            cntr.xpos=(dots[0].xpos+dots[2].xpos)/2;
            cntr.ypos=(dots[0].ypos+dots[2].ypos)/2;
        };

        function buildFigure (dots, rad, center){          
            buildPoints (dots);
            paint = false;
    
            ctx.beginPath();
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = '3';
            ctx.moveTo(dots[0].xpos, dots[0].ypos);
            for (i=1; i<4; i++){
                ctx.lineTo(dots[i].xpos, dots[i].ypos);
                ctx.stroke();
            }
            ctx.lineTo(dots[0].xpos, dots[0].ypos);
            ctx.stroke();
            
            buildCircle(center.xpos, center.ypos, rad, 'yellow');
            showParameters(points, s);
        };

        function buildPoints (dots){
            for(var i=0; i <dots.length; i++){
                if(dots[i].isSelected) {makePointColored(dots[i].xpos, dots[i].ypos,'green');}
                makePointColored(dots[i].xpos, dots[i].ypos,'red');
            }
        };

        function isCursorInDot(x,y,dot){
            return x > dot.xpos - 5.5 && x < dot.xpos + 5.5 && y > dot.ypos - 5.5 && y < dot.ypos + 5.5;
        };

        //set new coordinates to selected point and it's opposite one
        function makeNewCoord(selectedPoint, mousePosition){
            var dx = selectedPoint.xpos-mousePosition.xpos;
            var dy = selectedPoint.ypos-mousePosition.ypos;
            selectedPoint.xpos=mousePosition.xpos;
            selectedPoint.ypos=mousePosition.ypos;
            var op = selectedPoint.contr;
            points[op].xpos = points[op].xpos+dx;
            points[op].ypos = points[op].ypos+dy;
        };

        function movePoint(e){
            if(paint)return;

            mouse.xpos = e.clientX;
            mouse.ypos = e.clientY;

            for (let j = 0; j < points.length; j++) {
                if(points[j].isSelected) 
                makeNewCoord(points[j],mouse);
                showParameters(points, s);
                ctx.clearRect(0, 0, canv.width, canv.height);  
                calcParameters(points);
                buildFigure(points,r,cntr);
            }
        };

        function selectPoint(e){
            if(paint) return;
            var mx = e.clientX;
            var my = e.clientY;

            for (var i = 0; i<points.length; i++){
                if(isCursorInDot(mx, my, points[i])){
                    points[i].isSelected=true;
                    }     
            }
            for (var i = 0; i<points.length; i++){
                if(points[i].isSelected){
                        makePointColored(points[i].xpos, points[i].ypos,'green');
                    }
            }
        };

        //set dots attributes to 'defaults'
        function refresh(){
            if(paint)return;
            for (var i = 0; i<points.length; i++){
                points[i].isSelected=false;
                makePointColored(points[i].xpos, points[i].ypos, 'red');
            }
        };

        canv.addEventListener('mousemove', movePoint)
        canv.addEventListener('click', setPoint);
        canv.addEventListener('mousedown', selectPoint);
        canv.addEventListener('mouseup', refresh);  