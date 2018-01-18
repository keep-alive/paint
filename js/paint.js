

;(function(name,fuc){
    "function" == typeof define && define.amd ? define([], fuc) : "object" == typeof exports ? module.exports = fuc() : this[name] = fuc()
})('paint',function(){
    function paint(obj){

        var options = {
            dom:"cross",
            r:250,
            radius:100,
            strDirection:[1,2,3],
            xyOffsetArray:["20,0","20,-20","0,-20","-20,-20","-20,0","-20,20","0,20","20,20"], //车道方向偏移量优化定义输入条件
            roadLaneNumArray:["3,3","3,3","3,3","3,3","3,3","3,3","3,3","3,3"],//每个方向车道数量（进口，出口）
            roadLaneTypeArray:[],//每个方向车道图片
            roadBuffer:["1","1","1","1","1","1","1","1"],//每个方向隔离类型
            roadNames:["","","","","","","",""],//每个方向路口名
            drawZebraFlags:[true,true,true,true,true,true,true,true],//是否画斑马线
            secondZebraFlags:[0,0,0,0,0,0,0,0,0],//是否二次过街
            detectorPointArray:[], //检测器点位
            tramRoad:[]//有轨电车出口方向
        };
        var option = Object.assign({},options,obj)
        var dom = option.dom;
        var cs = document.getElementById(dom);
        var cx = cs.getContext("2d");
        //外圆
        cx.strokeStyle = "#000000";
        cx.beginPath();
        var r = option.r;
        var radius = option.radius;
        cx.arc(r,r,radius,0, 2 * Math.PI, true);
        var northImage = document.getElementById("North");
        var greenBand = document.getElementById("greenBand");
        var ecPath = document.getElementById("ecPath");
        var oprtns = new Array(
            "source-over",
            "destination-over",
            "source-in",
            "destination-in",
            "source-out",
            "destination-out",
            "source-atop",
            "destination-atop",
            "lighter",
            "xor",
            "copy"
        );
        var xyOffsetArray = option.xyOffsetArray;
        var roadLaneNumArray = option.roadLaneNumArray;
        var roadLaneTypeArray = option.roadLaneTypeArray;
        roadLaneTypeArray = LaneTypeArray(roadLaneNumArray);
        var roadBuffer = option.roadBuffer;
        var roadNames = option.roadNames;
        var drawZebraFlags = option.drawZebraFlags;
        var secondZebraFlags = option.secondZebraFlags;
    
        //每个方向不同车道属性或者图片路径（属性，图片路径）
        var roadLaneAttributeArray = new Array(8);
        for (var i = 0; i < 8; i++) {
            roadLaneAttributeArray[i] = new Array();
        }
        //存放检测器（P）点位
        var detectorPointArray = option.detectorPointArray;
        for(var i = 0;i<8;i++){
            detectorPointArray[i] = [];
        }
        //保存有轨电车出口方向
        var tramRoad = option.tramRoad;
        //存放road的点
        var roadPointArray = new Array(8);
        //存放每条road的不同车道点位
        var roadLanePointArray = new Array(8);
        for (var i = 0; i < 8; i++) {
            roadLanePointArray[i] = new Array();
        }
        //每个车道上的箭头位置
        var roadLaneArrowPointArray = new Array(8);
        for (var i = 0; i < 8; i++) {
            roadLaneArrowPointArray[i] = new Array();
        }
        //存放每条road的弧点
        var roadRadianPointArray = new Array(8);
        //存放每条road的停车线点位
        var roadStopLinePointArray = new Array(8);
    
        var zebraColor = [];
        zebraColor[0] = ["#fff","#fff"];
        zebraColor[1] = ["#fff","#fff"];
        zebraColor[2] = ["#fff","#fff"];
        zebraColor[3] = ["#fff","#fff"];
        zebraColor[4] = ["#fff","#fff"];
        zebraColor[5] = ["#fff","#fff"];
        zebraColor[6] = ["#fff","#fff"];
        zebraColor[7] = ["#fff","#fff"];
        //存放进口车道的斑马线点位
        var roadZebraLineInLanePointArray = new Array(8);
        for (var i = 0; i < 8; i++) {
            roadZebraLineInLanePointArray[i] = new Array();
        }
        //存放出口车道的斑马线点位
        var roadZebraLineOutLanePointArray = new Array(8);
        for (var i = 0; i < 8; i++) {
            roadZebraLineOutLanePointArray[i] = new Array();
        }
        //用于存放各个边弧度开始结束信息（开始弧度，结束弧度）
        var roadRadianArray = new Array(8);
        var selectRoadId = -1;
        var selectLaneId = -1;
    
        function reDraw() {
            // var cs = document.getElementById("cross");
            // var cx = cs.getContext("2d");
            cx.clearRect(0, 0, 500, 500);
            //清空每个方向不同车道属性或者图片路径（属性，图片路径）
            roadLaneAttributeArray = new Array(8);
            for (var i = 0; i < 8; i++) {
                roadLaneAttributeArray[i] = new Array();
            }
            //////////////////////点位输出结果/////////////////////////////////
            //清空存放road的点
            roadPointArray = new Array(8);
            //清空存放每条road的不同车道点位
            roadLanePointArray = new Array(8);
            for (var i = 0; i < 8; i++) {
                roadLanePointArray[i] = new Array();
            }
            //清空每个车道上的箭头位置
            roadLaneArrowPointArray = new Array(8);
            for (var i = 0; i < 8; i++) {
                roadLaneArrowPointArray[i] = new Array();
            }
            //清空存放每条road的弧点
            roadRadianPointArray = new Array(8);
            //清空存放每条road的停车线点位
            roadStopLinePointArray = new Array(8);
            //清空jinkou每条车道的斑马线点位
            roadZebraLineInLanePointArray = new Array(8);
            for (var i = 0; i < 8; i++) {
                roadZebraLineInLanePointArray[i] = new Array();
            }
            //清空chukou每条车道的斑马线点位
            roadZebraLineOutLanePointArray = new Array(8);
            for (var i = 0; i < 8; i++) {
                roadZebraLineOutLanePointArray[i] = new Array();
            }
            //清空用于存放各个边弧度开始结束信息（开始弧度，结束弧度）
            roadRadianArray = new Array(8);
        }
        //1东，2东北，3北，4西北，5西，6西南，7南，8东南
        //offsetAngle图形整体旋转角度,strDirection方向字符串
        var strDirection = option.strDirection;
        var offsetAngle = 0;
        function noStandarDdierection() {
            
            var onePiceOfEight = 2 * Math.PI / 8;
            var onePiceOfFour = 2 * Math.PI / 4;
            var onePice = onePiceOfEight;
            var isFour = false;
            var directions = strDirection;
    
            var hasEightDirection = 0;
            var hasFourDirection = 0;
            for (var i in directions) {
                if (directions[i] % 2 == 0) {
                    hasEightDirection = 1;
                } else {
                    hasFourDirection = 1;
                }
            }
    
            if (hasEightDirection == 1 && hasFourDirection == 1) {
                onePice = onePiceOfEight;
                isFour = false;
            } else if (hasEightDirection == 1 && hasFourDirection == 0 || hasEightDirection == 0 && hasFourDirection == 1) {
                onePice = onePiceOfFour;
                isFour = true;
            }
            else {
                console.log("参数错误！");
                // return;
            }
    
    
            for (var i in directions) {
                var directionNo = parseInt(directions[i]);
                calculateSideRadian(directionNo, onePice, offsetAngle, isFour);
            }
            optimizeSidePoints(isFour);
            BlackSide(directions);
            Draw();
    
            return {
                cs:cs,
                cx:cx,
                strDirection:strDirection,
                roadPointArray:roadPointArray,
                roadLanePointArray:roadLanePointArray,
                roadLaneNumArray:roadLaneNumArray,
                detectorPointArray,detectorPointArray,
                roadLaneTypeArray:roadLaneTypeArray,
                roadBuffer:roadBuffer,
                tramRoad:tramRoad,
                drawZebraFlags:drawZebraFlags,
                secondZebraFlags:secondZebraFlags,
                // isContain:isContain,
                mouseChoose:mouseChoose
            };
            
        }
    
        //计算各个线段的起始弧度
        function calculateSideRadian(directionNo, onePice, offsetAngle, isFour) {
            var directionOffset = -1;
            if (isFour) {
                if (directionNo % 2 == 1)
                    directionOffset = Math.floor(directionNo / 2) + 1;
                else
                    directionOffset = (directionNo - 1) / 2 + 1;
            }
            else {
                directionOffset = directionNo;
            }
            var startAngle = (directionOffset - 1) * onePice + (-onePice + offsetAngle) / 2;
            //保存弧度
            roadRadianArray[directionNo - 1] = startAngle + "," + (startAngle + onePice);
        }
        //优化连线点位最好根据每一方向车道实际宽度和来做优化，并根据线函数,
        function optimizeSidePoints(isFour) {
    
            var first = true;
            var lastRoadMiddleRadian = -1.0;
            var lastRaodLaneNum = -1.0;
            var firstoadMiddleRadian = -1.0;
            var firstRaodLaneNum = -1.0;
            var radianOfOneLane = Math.PI / 8;//最大车道宽度对应的弧
            var hasGreenBand = 0;//如果是绿化带则为1
            for (var i in roadRadianArray) {
    
                roadBuffer[i]==6?roadBufferType=1:roadBufferType=0;
                var startRadian = parseFloat(roadRadianArray[i].split(",")[0]);
                var endRadian = parseFloat(roadRadianArray[i].split(",")[1]);
    
                if (first) {
                    firstoadMiddleRadian = lastRoadMiddleRadian = (startRadian + endRadian) / 2;
                    firstRaodLaneNum = lastRaodLaneNum = parseInt(roadLaneNumArray[i].split(",")[0]) + parseInt(roadLaneNumArray[i].split(",")[1])+hasGreenBand;
                    first = false;
                }
                else {
                    var tempradianOfOneLane = ((startRadian + endRadian) / 2 - lastRoadMiddleRadian) / ((lastRaodLaneNum + parseInt(roadLaneNumArray[i].split(",")[0]) + parseInt(roadLaneNumArray[i].split(",")[1])+hasGreenBand) / 2);
                    radianOfOneLane = radianOfOneLane < tempradianOfOneLane ? radianOfOneLane : tempradianOfOneLane;
                    lastRoadMiddleRadian = (startRadian + endRadian) / 2;
                    lastRaodLaneNum = parseInt(roadLaneNumArray[i].split(",")[0]) + parseInt(roadLaneNumArray[i].split(",")[1])+hasGreenBand;
                }
    
                if (radianOfOneLane * lastRaodLaneNum > Math.PI)//路的弧度不能超过pi/2
                {
                    radianOfOneLane = (Math.PI) / lastRaodLaneNum;
                }
    
            }
            var endrRadianOfOneLane = (Math.PI * 2 - lastRoadMiddleRadian + firstoadMiddleRadian) / ((lastRaodLaneNum + firstRaodLaneNum) / 2);
            radianOfOneLane = radianOfOneLane < endrRadianOfOneLane ? radianOfOneLane : endrRadianOfOneLane;
            radianOfOneLane = radianOfOneLane < Math.PI / 15 ? Math.PI / 15 : radianOfOneLane;//单车道弧度不能小于Math.PI/15
            // //弧度优化,不能超过PI/2
            for (var i in roadRadianArray) {//i为字符串类型，需要转成Int
                var radianRemaining = Math.PI / 36;
                var startRadian = parseFloat(roadRadianArray[i].split(",")[0]);
                var endRadian = parseFloat(roadRadianArray[i].split(",")[1]);
                var middleRadian = (startRadian + endRadian) / 2;
    
                var offsetLane = (parseInt(roadLaneNumArray[i].split(",")[0]) + parseInt(roadLaneNumArray[i].split(",")[1])+hasGreenBand) / 2;
                //对于车道多的路口弧度做比例减少优化
                var optimizeRadianOfOneLane = radianOfOneLane;
                if (offsetLane * 2 > 4) {
                    var a0 = (1 - (offsetLane * 2 - 4) / 10);
                    if (a0 < 0.5)
                        a0 = 0.5;
                    optimizeRadianOfOneLane = a0 * radianOfOneLane;
                }
                roadRadianArray[i] = (middleRadian - (optimizeRadianOfOneLane * offsetLane) + radianRemaining) + "," + (middleRadian + optimizeRadianOfOneLane * offsetLane - radianRemaining);
            }
    
            for (var i in roadRadianArray) {//i为字符串类型，需要转成Int
                var startx, starty, endx, endy;
                if (isFour) {
                    startx = r + radius * Math.cos(parseFloat(roadRadianArray[i].split(",")[0])) + parseInt(xyOffsetArray[i].split(",")[0]);
                    starty = r - radius * Math.sin(parseFloat(roadRadianArray[i].split(",")[0])) + parseInt(xyOffsetArray[i].split(",")[1]);
                    endx = r + radius * Math.cos(parseFloat(roadRadianArray[i].split(",")[1])) + parseInt(xyOffsetArray[i].split(",")[0]);
                    endy = r - radius * Math.sin(parseFloat(roadRadianArray[i].split(",")[1])) + parseInt(xyOffsetArray[i].split(",")[1]);
    
                }
                else {
                    startx = r + radius * Math.cos(parseFloat(roadRadianArray[i].split(",")[0])) + parseInt(xyOffsetArray[i].split(",")[0]);
                    starty = r - radius * Math.sin(parseFloat(roadRadianArray[i].split(",")[0])) + parseInt(xyOffsetArray[i].split(",")[1]);
                    endx = r + radius * Math.cos(parseFloat(roadRadianArray[i].split(",")[1])) + parseInt(xyOffsetArray[i].split(",")[0]);
                    endy = r - radius * Math.sin(parseFloat(roadRadianArray[i].split(",")[1])) + parseInt(xyOffsetArray[i].split(",")[1]);
                }
    
                var directionNo = parseInt(i) + 1;
                drawRoad(directionNo, startx, starty, endx, endy, parseInt(xyOffsetArray[i].split(",")[0]), parseInt(xyOffsetArray[i].split(",")[1]),drawZebraFlags[directionNo-1]);
            }
    
        }
    
        function drawRoadName(cx, directions, offsetAngle,roadNames) {
            cx.font = '16px Arial';
            cx.textAlign = 'left';
            cx.textBaseline = 'top';
            cx.strokeStyle = "#000000"
            for (var i in directions) {
                var directionNo = directions[i];
                var point1x, point1y, point2x, point2y;
                point1x = roadPointArray[directionNo - 1][0].split(",")[0];
                point1y = roadPointArray[directionNo - 1][0].split(",")[1];
                cx.translate(point1x, point1y);
                cx.rotate(-(directionNo - 1) * Math.PI / 4 - offsetAngle / 2);
                if(4<=parseInt(directionNo) && parseInt(directionNo)<=6)
                {
                    cx.translate(130, 25);
                    cx.rotate(Math.PI);
                    cx.strokeText(roadNames[directionNo-1], 0, 0);
                    cx.rotate(-Math.PI);
                    cx.translate(-130, -25);
                }else {
                    cx.strokeText(roadNames[directionNo-1], 0, 0);
                }
    
                cx.rotate((directionNo - 1) * Math.PI / 4 + offsetAngle / 2);
                cx.translate(-point1x, -point1y);
    
            }
        }
        //空白边连线
        function BlackSide(directions) {
            var x, y;
            var length = directions.length;
            for (var i = 0; i < length; i++) {
                var directionNo = parseInt(directions[i]);
                var x1 = parseFloat(roadPointArray[directionNo - 1][3].split(",")[0]);
                var y1 = parseFloat(roadPointArray[directionNo - 1][3].split(",")[1]);
                var x11 = parseFloat(roadPointArray[directionNo - 1][2].split(",")[0]);
                var y11 = parseFloat(roadPointArray[directionNo - 1][2].split(",")[1]);
                var nextDirectionNo = -1;
                if (i < length - 1) {
                    nextDirectionNo = parseInt(directions[i + 1]);
                }
                else {
                    nextDirectionNo = parseInt(directions[0]);
                }
    
                var x2 = parseFloat(roadPointArray[nextDirectionNo - 1][0].split(",")[0]);
                var y2 = parseFloat(roadPointArray[nextDirectionNo - 1][0].split(",")[1]);
                var x22 = parseFloat(roadPointArray[nextDirectionNo - 1][1].split(",")[0]);
                var y22 = parseFloat(roadPointArray[nextDirectionNo - 1][1].split(",")[1]);
    
                var k1, k2;
                var a1 = x11 - x1;
                var b1 = y11 - y1;
                var a2 = x22 - x2;
                var b2 = y22 - y2;
                if (a1 > -0.0001 && a1 < 0.0001) {
                    //直线x = x1;
                    if (a2 > -0.0001 && a2 < 0.0001) {
                        //直线x = x2;
                        x = (x1 + x2) / 2;
                        y = (y1 + y2) / 2;
                    }
                    else {
                        //直线y = k2(x-x2) +y2;
                        k2 = b2 / a2;
                        x = x1;
                        y = k2 * (x - x2) + y2;
                    }
                }
                else {
                    //直线y = k1(x-x1) +y1;
                    k1 = b1 / a1;
    
                    if (a2 > -0.0001 && a2 < 0.0001) {
                        //直线x = x2;
                        x = x2;
                        y = k1 * (x - x1) + y1;
                    }
                    else {
                        //直线y = k2(x-x2) +y2;
                        k2 = b2 / a2;
                        if (k1 - k2 > -0.0001 && k1 - k2 < 0.0001) {
                            x = (x1 + x2) / 2;
                            y = (y1 + y2) / 2;
                        }
                        else {
                            x = (y2 - k2 * x2 + k1 * x1 - y1) / (k1 - k2);
                            y = k2 * (x - x2) + y2;
                        }
                    }
                }
    
    
                // cx.moveTo(x1, y1);
                // cx.quadraticCurveTo(x, y, x2, y2);
                // cx.stroke();
                roadRadianPointArray[directionNo - 1] = x + "," + y;
                // cx.beginPath();
                // cx.arc(x, y, 2, 0, 2 * Math.PI, true);
                // cx.stroke();
            }
    
        }
    
        //画线函数
        function Line(startx, starty, endx, endy ) {
            cx.beginPath();
            cx.moveTo(startx, starty);
            cx.lineTo(endx, endy);
            cx.strokeStyle = "#ffffff";
            cx.stroke();
            cx.closePath();
        }
    
        function drawRoad(directionNo, startx, starty, endx, endy, xoffset, yoffset,drawZebraFlag) {
            //记录road的四个点位
            var points = new Array(4);
            var centerx = (startx + endx) / 2;
            var centery = (starty + endy) / 2;
            var a = centerx - (r + xoffset);
            var b = centery - (r + yoffset);
            var offset = 130;
            var zebraLength = 15;
            var x1, y1, x2, y2, kk, k = 10000;//10000
            if (a > -0.0001 && a < 0.0001) {
                if (b < 0) {
                    offset = -offset;
                    zebraLength = -zebraLength;
                } else { }
    
                points[0] = startx + "," + starty;
                points[1] = startx + "," + (starty + offset);
                points[2] = endx + "," + (endy + offset);
                points[3] = endx + "," + endy;
                roadPointArray[directionNo - 1] = points;
                //画图部分
                //道路填充颜色
                drawLane(directionNo, kk, k, offset);
                drawZebraFlag == true ? drawZebraLine(directionNo, k, 4, zebraLength) : "";
    
            } else {
                k = b / a;
                //y = k(x-x2)+y2
                //(y-y2)^2 + (x-x2)^2 = offset^2
                //计算x 和 y
    
                if (a > 0)//往右画
                {
                    zebraLength = -Math.abs(zebraLength);
                    kk = Math.pow(Math.pow(offset, 2) / (Math.pow(k, 2) + 1), 1 / 2);
                    x1 = Math.pow(Math.pow(offset, 2) / (Math.pow(k, 2) + 1), 1 / 2) + startx;
                    y1 = k * (x1 - startx) + starty;
                    x2 = Math.pow(Math.pow(offset, 2) / (Math.pow(k, 2) + 1), 1 / 2) + endx;
                    y2 = k * (x2 - endx) + endy;
                } else//往左画
                {
                    zebraLength = Math.abs(zebraLength);
                    kk = -Math.pow(Math.pow(offset, 2) / (Math.pow(k, 2) + 1), 1 / 2);
                    x1 = -Math.pow(Math.pow(offset, 2) / (Math.pow(k, 2) + 1), 1 / 2) + startx;
                    y1 = k * (x1 - startx) + starty;
                    x2 = -Math.pow(Math.pow(offset, 2) / (Math.pow(k, 2) + 1), 1 / 2) + endx;
                    y2 = k * (x2 - endx) + endy;
    
                }
                points[0] = startx + "," + starty;
                points[1] = x1 + "," + y1;
                points[2] = x2 + "," + y2;
                points[3] = endx + "," + endy;
                roadPointArray[directionNo - 1] = points;
                drawLane(directionNo, kk, k, offset);
                drawZebraFlag == true ? drawZebraLine(directionNo, k, 4, zebraLength) : "";
    
            }
        }
        //车道
        function drawLane(directionNo, kk, k0, offset) {
            var startx, starty, endx, endy, inLaneNum, outLaneNum, hasGreenBand,roadBufferType;
            inLaneNum = parseInt(roadLaneNumArray[directionNo - 1].split(",")[0]);
            outLaneNum = parseInt(roadLaneNumArray[directionNo - 1].split(",")[1]);
            roadBufferType = roadBuffer[directionNo - 1];
            hasGreenBand = roadBufferType==6||roadBufferType==7?1:0;
    
            startx = parseFloat((roadPointArray[directionNo - 1][0].split(","))[0]);
            starty = parseFloat((roadPointArray[directionNo - 1][0].split(","))[1]);
            endx = parseFloat((roadPointArray[directionNo - 1][3].split(","))[0]);
            endy = parseFloat((roadPointArray[directionNo - 1][3].split(","))[1]);
    
            var a = startx - endx;
            var b = starty - endy;
            var allWidth = Math.pow(Math.pow(a, 2) + Math.pow(b, 2), 1 / 2);
            var oneLaneWidth = allWidth / (inLaneNum + outLaneNum+hasGreenBand);
         
            if (a > -0.0001 && a < 0.0001) {
                //移动y值
                if (b < 0) {
                    oneLaneWidth = -oneLaneWidth;
                }
                for (var i = 1; i < inLaneNum + outLaneNum + hasGreenBand; i++) {
    
                    y1 = i * oneLaneWidth + endy;
                    x1 = endx;
                    x2 = kk + x1;
                    y2 = k0 * (x2 - x1) + y1;
                    //保存车道点位
                    var tempArray = new Array(2);
                    tempArray[0] = x1 + "," + y1;
                    tempArray[1] = x2 + "," + y2;
                    
                    roadLanePointArray[directionNo - 1].push(tempArray);
                    if (i == inLaneNum) {
                        //如果是双簧线
                        if(roadBufferType ==3 ||roadBufferType ==4)
                        {
                            y1 = i * oneLaneWidth +(oneLaneWidth/7) + endy;
                            x1 = endx;
                            x2 = kk + x1;
                            y2 = k0 * (x2 - x1) + y1;
                            //保存车道点位
                            var tempArray = new Array(2);
                            tempArray[0] = x1 + "," + y1;
                            tempArray[1] = x2 + "," + y2;
                            roadLanePointArray[directionNo - 1].push(tempArray);
                        }else if(roadBufferType ==7){
                            // 检测器点位
                            var ecArray = [];
                            ecArray[0] = parseInt(x1)+offset*2/3+ "," +y1;
                            ecArray[1] = parseInt(x1)+offset*1/3+ "," +y1;
                            ecArray[2] = x1+ "," +y1;
                            ecArray[3] = x1+ "," +(parseInt(y1)+oneLaneWidth);
                            ecArray[4] = parseInt(x1)+offset+ "," +(parseInt(y1)+oneLaneWidth);
                            detectorPointArray[directionNo - 1]=ecArray;
                        }
                        //停车线
                        //保存停车线
                        var array = new Array(2);
                        array[0] = x1 + "," + y1;
                        array[1] = endx + "," + endy;
                        roadStopLinePointArray[directionNo - 1] = array;
                    }
                    
                }
            }
            else {
                var x1, y1, x2, y2;
                var k = b / a;
                //y = k(x-x0)+y0
                if (b > -0.0001 && b < 0.0001) {
                    if (a < 0) {
                        oneLaneWidth = -Math.abs(oneLaneWidth);
                    }
                    else {
                        oneLaneWidth = Math.abs(oneLaneWidth);
                    }
                    for (var i = 1; i < inLaneNum + outLaneNum+ hasGreenBand; i++) {
                        y1 = endy;
                        x1 = i * oneLaneWidth + endx;
                        if (k0 != 10000) {
                            x2 = kk + x1;
                            y2 = k0 * (x2 - x1) + y1;
                        } else {
                            x2 = x1;
                            y2 = y1 + offset;
                        }
                        //保存车道点位
                        var tempArray = new Array(2);
                        tempArray[0] = x1 + "," + y1;
                        tempArray[1] = x2 + "," + y2;
                        roadLanePointArray[directionNo - 1].push(tempArray);
                        if (i == inLaneNum) {
                            //如果是双簧线
                            if(roadBufferType ==3 ||roadBufferType ==4)
                            {
                                y1 = endy;
                                x1 = i * oneLaneWidth +(oneLaneWidth/7)+ endx;
                                if (k0 != 10000) {
                                    x2 = kk + x1;
                                    y2 = k0 * (x2 - x1) + y1;
                                } else {
                                    x2 = x1;
                                    y2 = y1 + offset;
                                }
                                var tempArray = new Array(2);
                                tempArray[0] = x1 + "," + y1;
                                tempArray[1] = x2 + "," + y2;
                                roadLanePointArray[directionNo - 1].push(tempArray);
                            }else if(roadBufferType ==7){
                                // 检测器点位
                                var ecArray = [];
                                ecArray[0] = x1+"," +(parseInt(y1)+offset*2/3);
                                ecArray[1] = x1+"," +(parseInt(y1)+offset*1/3);
                                ecArray[2] = x1+ "," +y1;
                                ecArray[3] = parseInt(x1)+oneLaneWidth+"," +y1;
                                ecArray[4] = parseInt(x1)+oneLaneWidth+"," +(parseInt(y1)+offset);
                                detectorPointArray[directionNo - 1]=ecArray;
                                
                            }
                            //停车线
                            //保存停车线
                            var array = new Array(2);
                            array[0] = x1 + "," + y1;
                            array[1] = endx + "," + endy;
                            roadStopLinePointArray[directionNo - 1] = array;
                        } else {
    
                        }
                    }
    
                } else if (b < 0) {//往上
                    //x = (y-y0)/k+x0
                    //(x-x0)^2+(y-y0)^2 = d^2
                    for (var i = 1; i < inLaneNum + outLaneNum+hasGreenBand; i++) {
                        var pointOffset = -Math.pow(Math.pow(i * oneLaneWidth, 2) / (1 / Math.pow(k, 2) + 1), 1 / 2);
                        y1 = pointOffset + endy;
                        x1 = (y1 - endy) / k + endx;
                        x2 = kk + x1;
                        y2 = k0 * (x2 - x1) + y1;
                        //保存车道点位
                        var tempArray = new Array(2);
                        tempArray[0] = x1 + "," + y1;
                        tempArray[1] = x2 + "," + y2;
                        roadLanePointArray[directionNo - 1].push(tempArray);
                        if (i == inLaneNum) {
                            //如果是双簧线
                            if(roadBufferType ==3 ||roadBufferType ==4)
                            {
                                y1 = -Math.pow(Math.pow(i * oneLaneWidth+oneLaneWidth/7, 2) / (1 / Math.pow(k, 2) + 1), 1 / 2) + endy;
                                x1 = (y1 - endy) / k + endx;
                                x2 = kk + x1;
                                y2 = k0 * (x2 - x1) + y1;
                                //保存车道点位
                                var tempArray = new Array(2);
                                tempArray[0] = x1 + "," + y1;
                                tempArray[1] = x2 + "," + y2;
                                roadLanePointArray[directionNo - 1].push(tempArray);
                            }else if(roadBufferType ==7){
                                // 检测器点位
                                 var ecArray = [];
                                 var twoOffset = -Math.pow(Math.pow((i+1) * oneLaneWidth, 2) / (1 / Math.pow(k, 2) + 1), 1 / 2);
                                ecArray[0] = kk*2/3 + x1+"," +(k0 * (x2 - x1)*2/3 + y1);
                                ecArray[1] = kk*1/3 + x1 +"," +(k0 * (x2 - x1)/3 + y1);
                                ecArray[2] = x1+ "," +y1;
                                ecArray[3] = twoOffset/k+endx+"," +(twoOffset+endy);
                                ecArray[4] = kk+twoOffset/k+endx+"," +(twoOffset+endy+k0*kk);
                                // ecArray[0] = kk*2/3 + x1+"," +(pointOffset*1/3 + y2);
                                // ecArray[1] = kk*1/3 + x1 +"," +(pointOffset*2/3 + y2);
                                // ecArray[2] = x1+ ","  +(-pointOffset*2/3 + y1);
                                // ecArray[3] = x1+"," +y1;
                                detectorPointArray[directionNo - 1]=ecArray;
                                
                            }
                            //停车线
                            //保存停车线
                            var array = new Array(2);
                            array[0] = x1 + "," + y1;
                            array[1] = endx + "," + endy;
                            roadStopLinePointArray[directionNo - 1] = array;
                        } else {
                        }
                    }
                } else {//往下
                    for (var i = 1; i < inLaneNum + outLaneNum+hasGreenBand; i++) {
                        y1 = Math.pow(Math.pow(i * oneLaneWidth, 2) / (1 / Math.pow(k, 2) + 1), 1 / 2) + endy;
                        x1 = (y1 - endy) / k + endx;
                        x2 = kk + x1;
                        y2 = k0 * (x2 - x1) + y1;
                        //保存车道点位
                        var tempArray = new Array(2);
                        tempArray[0] = x1 + "," + y1;
                        tempArray[1] = x2 + "," + y2;
                        roadLanePointArray[directionNo - 1].push(tempArray);
                        if (i == inLaneNum) {
                            //如果是双簧线
                            if(roadBufferType ==3 ||roadBufferType ==4)
                            {
                                y1 = Math.pow(Math.pow(i * oneLaneWidth+oneLaneWidth/7, 2) / (1 / Math.pow(k, 2) + 1), 1 / 2) + endy;
                                x1 = (y1 - endy) / k + endx;
                                x2 = kk + x1;
                                y2 = k0 * (x2 - x1) + y1;
                                //保存车道点位
                                var tempArray = new Array(2);
                                tempArray[0] = x1 + "," + y1;
                                tempArray[1] = x2 + "," + y2;
                                roadLanePointArray[directionNo - 1].push(tempArray);
                            }else if(roadBufferType ==7){
                                // 检测器点位
                                 var ecArray = [];
                                 var twoOffset = Math.pow(Math.pow((i+1) * oneLaneWidth, 2) / (1 / Math.pow(k, 2) + 1), 1 / 2);
                                ecArray[0] = kk*2/3 + x1+"," +(k0 * (x2 - x1)*2/3 + y1);
                                ecArray[1] = kk*1/3 + x1 +"," +(k0 * (x2 - x1)/3 + y1);
                                ecArray[2] = x1+ "," +y1;
                                ecArray[3] = twoOffset/k+endx+"," +(twoOffset+endy);
                                ecArray[4] = kk+twoOffset/k+endx+"," +(twoOffset+endy+k0*kk);
                                detectorPointArray[directionNo - 1]=ecArray;
                            }
                            //停车线
                            //保存停车线
                            var array = new Array(2);
                            array[0] = x1 + "," + y1;
                            array[1] = endx + "," + endy;
                            roadStopLinePointArray[directionNo - 1] = array;
                        } else {
                        }
                    }
                }
    
            }
            
        }
    
        //斑马线
        function drawZebraLine(directionNo, k0, zebraWidth, zebraLength) {
            var startx, starty, endx, endy,middleWidth;
            startx = parseFloat((roadPointArray[directionNo - 1][0].split(","))[0]);
            starty = parseFloat((roadPointArray[directionNo - 1][0].split(","))[1]);
            endx = parseFloat((roadPointArray[directionNo - 1][3].split(","))[0]);
            endy = parseFloat((roadPointArray[directionNo - 1][3].split(","))[1]);
    
            var a = startx - endx;
            var b = starty - endy;
            var allWidth = Math.pow(Math.pow(a, 2) + Math.pow(b, 2), 1 / 2);
            var inLineNum = parseInt(roadLaneNumArray[directionNo - 1].split(",")[0]);
            var outLineNum = parseInt(roadLaneNumArray[directionNo - 1].split(",")[1]);
            middleWidth = allWidth/(inLineNum+outLineNum)*inLineNum;
            var kk;
            if (zebraLength > 0)
                kk = Math.pow(Math.pow(zebraLength, 2) / (Math.pow(k0, 2) + 1), 1 / 2);
            else
                kk = -Math.pow(Math.pow(zebraLength, 2) / (Math.pow(k0, 2) + 1), 1 / 2);
            var zebraCount = Math.floor(allWidth / zebraWidth);
    
            if (a > -0.0001 && a < 0.0001) {
                //移动y值
                if (b < 0) {
                    zebraWidth = -zebraWidth;
                }
                for (var i = 0; i <= zebraCount; i++) {
                    y1 = i * zebraWidth + endy;
                    x1 = endx;
                    x2 = kk + x1;
                    y2 = k0 * (x2 - x1) + y1;
                    //保存斑马线
                    var tempArray = new Array(2);
                    tempArray[0] = x1 + "," + y1;
                    tempArray[1] = x2 + "," + y2;
                    if(Math.abs(i * zebraWidth)<middleWidth){
                        roadZebraLineInLanePointArray[directionNo - 1].push(tempArray);
                    }else {
                        roadZebraLineOutLanePointArray[directionNo - 1].push(tempArray);
                    }
    
                }
            }
            else {
                var x1, y1, x2, y2;
                var k = b / a;
                //y = k(x-x0)+y0
                if (b > -0.0001 && b < 0.0001) {
                    if (a < 0) {
                        zebraWidth = -Math.abs(zebraWidth);
                    }
                    else {
                        zebraWidth = Math.abs(zebraWidth);
                    }
                    for (var i = 0; i <= zebraCount; i++) {
                        y1 = endy;
                        x1 = i * zebraWidth + endx;
                        if (k0 != 10000) {
                            x2 = kk + x1;
                            y2 = k0 * (x2 - x1) + y1;
                        } else {
                            x2 = x1;
                            y2 = y1 - zebraLength;
                        }
    
                        //保存斑马线
                        var tempArray = new Array(2);
                        tempArray[0] = x1 + "," + y1;
                        tempArray[1] = x2 + "," + y2;
                        if(Math.abs(i * zebraWidth)<middleWidth){
                            roadZebraLineInLanePointArray[directionNo - 1].push(tempArray);
                        }else {
                            roadZebraLineOutLanePointArray[directionNo - 1].push(tempArray);
                        }
                    }
    
                } else if (b < 0) {//往上
                    //x = (y-y0)/k+x0
                    //(x-x0)^2+(y-y0)^2 = d^2
                    for (var i = 0; i <= zebraCount; i++) {
                        y1 = -Math.pow(Math.pow(i * zebraWidth, 2) / (1 / Math.pow(k, 2) + 1), 1 / 2) + endy;
                        x1 = (y1 - endy) / k + endx;
                        x2 = kk + x1;
                        y2 = k0 * (x2 - x1) + y1;
                        //保存斑马线
                        var tempArray = new Array(2);
                        tempArray[0] = x1 + "," + y1;
                        tempArray[1] = x2 + "," + y2;
                        if(Math.abs(i * zebraWidth)<middleWidth){
                            roadZebraLineInLanePointArray[directionNo - 1].push(tempArray);
                        }else {
                            roadZebraLineOutLanePointArray[directionNo - 1].push(tempArray);
                        }
                    }
                } else {//往下
                    for (var i = 0; i <= zebraCount; i++) {
                        y1 = Math.pow(Math.pow(i * zebraWidth, 2) / (1 / Math.pow(k, 2) + 1), 1 / 2) + endy;
                        x1 = (y1 - endy) / k + endx;
                        x2 = kk + x1;
                        y2 = k0 * (x2 - x1) + y1;
                        //保存斑马线
                        var tempArray = new Array(2);
                        tempArray[0] = x1 + "," + y1;
                        tempArray[1] = x2 + "," + y2;
                        if(Math.abs(i * zebraWidth)<middleWidth){
                            roadZebraLineInLanePointArray[directionNo - 1].push(tempArray);
                        }else {
                            roadZebraLineOutLanePointArray[directionNo - 1].push(tempArray);
                        }
                    }
                }
            }
        }
    
        function drawBackColor(cx1) {
            // 填充弧底色
            {
                var startx = -1, starty = -1;
                var x0, y0, x3 = -1, y3 = -1, xR, yR, lastDirection = -1, startDirection = -1;
                for (var i in roadPointArray) {
                    x0 = roadPointArray[i][0].split(",")[0];
                    y0 = roadPointArray[i][0].split(",")[1];
                    if (startDirection == -1) {
                        startDirection = i;
                    }
    
                    if (startx == -1) {
                        startx = x0;
                        starty = y0;
                    } else {
                        cx1.lineTo(x0, y0);
    
                    }
    
                    if (x3 != -1) {
                        if (i - lastDirection < 4) {
                            cx1.fill();
                            cx1.globalCompositeOperation = oprtns[5];
                        }
                        cx1.beginPath();
                        cx1.moveTo(x3, y3);
                        cx1.quadraticCurveTo(xR, yR, x0, y0);
                        cx1.fill();
                        cx1.globalCompositeOperation = oprtns[0];
                    }
    
                    x3 = roadPointArray[i][3].split(",")[0];
                    y3 = roadPointArray[i][3].split(",")[1];
                    cx1.beginPath();
                    cx1.moveTo(x3, y3);
                    xR = roadRadianPointArray[i].split(",")[0];
                    yR = roadRadianPointArray[i].split(",")[1];
                    cx1.lineTo(xR, yR);
                    lastDirection = i;
                }
                cx1.lineTo(startx, starty);
                if (8 - lastDirection + parseInt(startDirection) < 4) {
                    cx1.fill();
                    cx1.globalCompositeOperation = oprtns[5];
    
                }
    
                cx1.beginPath();
                cx1.moveTo(x3, y3);
                cx1.quadraticCurveTo(xR, yR, startx, starty);
                cx1.fill();
                cx1.globalCompositeOperation = oprtns[0];
    
            }
            //填充中间剩余区域颜色
            cx1.beginPath();
            cx1.strokeStyle = "#464547";
            {
                var startx = -1, starty = -1;
                var x0, y0, x3, y3, xR = -1, yR = -1, lastDirection = -1, startDirection = -1;
                for (var i in roadPointArray) {
    
                    if (i - lastDirection < 4 && xR != -1) {
                        cx1.lineTo(xR, yR);
                    }
    
                    x0 = roadPointArray[i][0].split(",")[0];
                    y0 = roadPointArray[i][0].split(",")[1];
                    if (startx == -1) {
                        startx = x0;
                        starty = y0;
                        cx1.moveTo(x0, y0);
                    } else {
                        cx1.lineTo(x0, y0);
                    }
                    if (startDirection == -1) {
                        startDirection = i;
                    }
                    x3 = roadPointArray[i][3].split(",")[0];
                    y3 = roadPointArray[i][3].split(",")[1];
                    cx1.lineTo(x3, y3);
                    xR = roadRadianPointArray[i].split(",")[0];
                    yR = roadRadianPointArray[i].split(",")[1];
                    lastDirection = i;
                }
                if (8 - lastDirection + parseInt(startDirection) < 4 && xR != -1) {
                    cx1.lineTo(xR, yR);
                }
                cx1.lineTo(startx, starty);
                cx1.stroke();
                cx1.fill();
            }
    
            cx1.beginPath();
            cx1.strokeStyle = "#ffffff";
            //画轮廓
            {
                var startx = -1, starty = -1;
                var x0, y0, x1, y1, x2, y2, x3 = -1, y3 = -1, xR, yR;
                for (var i in roadPointArray) {
                    x0 = roadPointArray[i][0].split(",")[0];
                    y0 = roadPointArray[i][0].split(",")[1];
                    cx1.moveTo(x0, y0);
                    x1 = roadPointArray[i][1].split(",")[0];
                    y1 = roadPointArray[i][1].split(",")[1];
                    cx1.lineTo(x1, y1);
                    x2 = roadPointArray[i][2].split(",")[0];
                    y2 = roadPointArray[i][2].split(",")[1];
                    cx1.lineTo(x2, y2);
                    x3 = roadPointArray[i][3].split(",")[0];
                    y3 = roadPointArray[i][3].split(",")[1];
                    cx1.lineTo(x3, y3);
                    xR = roadRadianPointArray[i].split(",")[0];
                    yR = roadRadianPointArray[i].split(",")[1];
                    cx1.fill();
                }
            }
    
        }
        function Draw() {
            var cs1 = document.getElementById(dom);
            var cx1 = cs1.getContext("2d");
            cx1.clearRect(0, 0, 500, 500);
            //指北针
            cx1.drawImage(northImage, 400, 0, 60, 75);
            cx1.strokeStyle = "#ffffff";
            cx1.beginPath();
            cx1.fillStyle = "#464547";
            drawBackColor(cx1);
            cx1.beginPath();
            cx1.strokeStyle = "#ffffff";
            //画轮廓
            {
                var startx = -1, starty = -1;
                var x0, y0, x1, y1, x2, y2, x3 = -1, y3 = -1, xR, yR;
                for (var i in roadPointArray) {
                    x0 = roadPointArray[i][0].split(",")[0];
                    y0 = roadPointArray[i][0].split(",")[1];
    
                    if (x3 != -1) {
                        cx1.quadraticCurveTo(xR, yR, x0, y0);
                    }
                    if (startx == -1) {
                        startx = x0;
                        starty = y0;
                    }
                    cx1.moveTo(x0, y0);
                    x1 = roadPointArray[i][1].split(",")[0];
                    y1 = roadPointArray[i][1].split(",")[1];
                    cx1.lineTo(x1, y1);
                    x2 = roadPointArray[i][2].split(",")[0];
                    y2 = roadPointArray[i][2].split(",")[1];
                    cx1.lineTo(x2, y2);
                    x3 = roadPointArray[i][3].split(",")[0];
                    y3 = roadPointArray[i][3].split(",")[1];
                    cx1.lineTo(x3, y3);
                    xR = roadRadianPointArray[i].split(",")[0];
                    yR = roadRadianPointArray[i].split(",")[1];
                }
                cx1.quadraticCurveTo(xR, yR, startx, starty);
                cx1.stroke();
            }
    
            //画车道
            cx1.beginPath();
            cx1.strokeStyle = "#ffffff";
            for (var i in roadLanePointArray) {
                //判断隔离线的类型
                var roadBufferType = roadBuffer[i];
                //进口车道数
                var roadInLaneNum = parseInt(roadLaneNumArray[i].split(",")[0]);
    
                for (var j in roadLanePointArray[i]) {
                    var x0 = roadLanePointArray[i][j][0].split(",")[0];
                    var y0 = roadLanePointArray[i][j][0].split(",")[1];
                    var x1 = roadLanePointArray[i][j][1].split(",")[0];
                    var y1 = roadLanePointArray[i][j][1].split(",")[1];
                    cx1.beginPath();
                    cx1.strokeStyle = "#FFFF00";
                    if((j == roadInLaneNum-1 ||j == roadInLaneNum)&&(roadBufferType ==3 )){
                        //画黄实线
                        cx1.moveTo(x0, y0);
                        cx1.lineTo(x1, y1);
                    }else if((j == roadInLaneNum-1 ||j == roadInLaneNum)&&(roadBufferType ==4 )){
                        //画黄虚线
                        drawDashLine(cx1,x0,y0,x1,y1,3);
                    }else if((j == roadInLaneNum-1)&&(roadBufferType ==1 ))
                    {
                        //画黄实线
                        cx1.moveTo(x0, y0);
                        cx1.lineTo(x1, y1);
    
                    }else if((j == roadInLaneNum-1)&&(roadBufferType ==2 ))
                    {
                        //画黄虚线
                        drawDashLine(cx1,x0,y0,x1,y1,3);
                    }else{
                        cx1.strokeStyle = "#ffffff";
                        cx1.moveTo(x0, y0);
                        cx1.lineTo(x1, y1);
                    }
                    cx1.stroke();
                }
    
            }
            cx1.strokeStyle = "#ffffff";
            //画停车线
            for (var i in roadStopLinePointArray) {
                var x0 = roadStopLinePointArray[i][0].split(",")[0];
                var y0 = roadStopLinePointArray[i][0].split(",")[1];
                var x1 = roadStopLinePointArray[i][1].split(",")[0];
                var y1 = roadStopLinePointArray[i][1].split(",")[1];
                cx1.moveTo(x0, y0);
                cx1.lineTo(x1, y1);
                cx1.stroke();
            }
    
            //画箭头
            var directions = strDirection;
            drawArrow(cx1, directions, offsetAngle);
            drawRoadName(cx1, directions, offsetAngle,roadNames);
            //画斑马线
            drawZebra(cx1)
            //画有轨车道出口圆弧
            drawCircle(tramRoad,detectorPointArray,cx1)
        }
    
        //求斜边长度
        function getBeveling(x,y)
        {
            return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
        }
    
        function drawDashLine(context,x1,y1,x2,y2,dashLen)
        {
    
            context.strokeStyle = "#FFFF00";
            //得到斜边的总长度
            var beveling = getBeveling(x2-x1,y2-y1);
            //计算有多少个线段
            var num = Math.floor(beveling/dashLen);
            for(var i = 0 ; i < num; i++)
            {
                if(i%2 == 0 ){
                    context.lineTo(parseFloat(x1)+(x2-x1)/num*i,parseFloat(y1)+(y2-y1)/num*i);
                }else {
                    context.moveTo(parseFloat(x1)+(x2-x1)/num*i,parseFloat(y1)+(y2-y1)/num*i);
                }
            }
        }
        //画箭头
        function drawArrow(cx, directions, offsetAngle) {
    
            for (var i in directions) {
                var directionNo = directions[i];
                var point1x, point1y, point2x, point2y;
                point1x = roadPointArray[directionNo - 1][3].split(",")[0];
                point1y = roadPointArray[directionNo - 1][3].split(",")[1];
                for (var j in roadLanePointArray[directionNo - 1]) {//j车道号
                    point2x = roadLanePointArray[directionNo - 1][j][0].split(",")[0];
                    point2y = roadLanePointArray[directionNo - 1][j][0].split(",")[1];
    
                    var tempx = (parseFloat(point1x) + parseFloat(point2x)) / 2;
                    var tempy = (parseFloat(point1y) + parseFloat(point2y)) / 2;
                    tempx = (parseFloat(point1x) + parseFloat(tempx)) / 2;
                    tempy = (parseFloat(point1y) + parseFloat(tempy)) / 2;
                    var x = (parseFloat(point1x) + parseFloat(tempx)) / 2;
                    var y = (parseFloat(point1y) + parseFloat(tempy)) / 2;
                    var laneWidth = (Math.pow(Math.pow(point2x - point1x, 2) + Math.pow(point2y - point1y, 2), 1 / 2));
    
                    if (j < parseInt(roadLaneNumArray[directionNo - 1].split(",")[0])) {
                        cx.translate(x, y);
                        cx.rotate(-(directionNo - 1) * Math.PI / 4 - offsetAngle / 2);
    
                        var arrow = document.getElementById(roadLaneTypeArray[directionNo - 1][j]);
                        cx.drawImage(arrow, 0, 0, 100 / 3, laneWidth * 3 / 4);//image后面用roadLaneAttributeArray里的定义100路段长度
                        cx.rotate((directionNo - 1) * Math.PI / 4 + offsetAngle / 2);
                        cx.translate(-x, -y);
    
                    }else{
                        if(j == parseInt(roadLaneNumArray[directionNo - 1].split(",")[0]) && roadBuffer[directionNo-1]==6) {
                            cx.translate(x, y);
                            cx.rotate(-(directionNo - 1) * Math.PI / 4 - offsetAngle / 2);
                            cx.drawImage(greenBand, 0, -2, 129 ,laneWidth-1 );//画绿化带
                            cx.rotate((directionNo - 1) * Math.PI / 4 + offsetAngle / 2);
                            cx.translate(-x, -y);
                        }else if(j == parseInt(roadLaneNumArray[directionNo - 1].split(",")[0]) && roadBuffer[directionNo-1]==7){
                            cx.translate(x, y);
                            cx.rotate(-(directionNo - 1) * Math.PI / 4 - offsetAngle / 2);
                            cx.drawImage(ecPath, 0, -2, 129 ,laneWidth-1 );//画有轨电车
                            cx.rotate((directionNo - 1) * Math.PI / 4 + offsetAngle / 2);
                            cx.translate(-x, -y);
                        }
    
                    }
                    point1x = point2x;
                    point1y = point2y;
                }
            }
        }
        //控制二次过街
        function drawZebra(cx1){
            for (var i in roadZebraLineInLanePointArray) {
                cx1.beginPath();
                cx1.strokeStyle = zebraColor[i][0];
                for (var j in roadZebraLineInLanePointArray[i]) {
                    var x0 = roadZebraLineInLanePointArray[i][j][0].split(",")[0];
                    var y0 = roadZebraLineInLanePointArray[i][j][0].split(",")[1];
                    var x1 = roadZebraLineInLanePointArray[i][j][1].split(",")[0];
                    var y1 = roadZebraLineInLanePointArray[i][j][1].split(",")[1];
                    cx1.moveTo(x0, y0);
                    cx1.lineTo(x1, y1);
                }
                cx1.stroke();
                cx1.closePath();
            }
            for (var i in roadZebraLineOutLanePointArray) {
                cx1.beginPath();
                cx1.strokeStyle = zebraColor[i][1];
                for (var j in roadZebraLineOutLanePointArray[i]) {
                    if(secondZebraFlags[i] == 1&&j==0){
                        // console.log(secondZebraFlags[i])
                    }else{
                        var x0 = roadZebraLineOutLanePointArray[i][j][0].split(",")[0];
                        var y0 = roadZebraLineOutLanePointArray[i][j][0].split(",")[1];
                        var x1 = roadZebraLineOutLanePointArray[i][j][1].split(",")[0];
                        var y1 = roadZebraLineOutLanePointArray[i][j][1].split(",")[1];
                        cx1.moveTo(x0, y0);
                        cx1.lineTo(x1, y1);
                    }
    
                }
                cx1.stroke();
                cx1.closePath();
            }
        }
        //画有轨电车圆弧
        function drawCircle(tramRoad,detectorPointArray,cx1){
            for(var i in tramRoad){
                var outDirec = tramRoad[i];
                if(outDirec){
                    var p5 = detectorPointArray[outDirec-1][4].split(',');
                    var p2 = detectorPointArray[i][1].split(',');
                    var p4 = detectorPointArray[outDirec-1][3].split(',');
                    var p3 = detectorPointArray[i][2].split(',');
    
                    var a = {
                        x:p2[0],
                        y:p2[1]
                    }
                    var b = {
                        x:p3[0],
                        y:p3[1]
                    }
                    var c = {
                        x:p4[0],
                        y:p4[1]
                    }
                    var d = {
                        x:p5[0],
                        y:p5[1]
                    }
                    var target = segmentsIntr(a, b, c, d);
                    cx1.strokeStyle = "#fff";
                    cx1.beginPath();
                    cx1.moveTo(p3[0],p3[1]);
                    if(target){
                        cx1.quadraticCurveTo(target.x, target.y, p4[0], p4[1]);
                        
                    }else{
                        console.log('ss')
                        cx1.lineTo(p4[0],p4[1]);
                    }
                    cx1.stroke();
                    
                }
            }
     
        }
        function segmentsIntr(a, b, c, d){    
        
                var denominator = (b.y - a.y)*(d.x - c.x) - (a.x - b.x)*(c.y - d.y);    
                if (denominator==0) {    
                    return false;    
                }    
                       
                var x = ( (b.x - a.x) * (d.x - c.x) * (c.y - a.y)     
                            + (b.y - a.y) * (d.x - c.x) * a.x     
                            - (d.y - c.y) * (b.x - a.x) * c.x ) / denominator ;    
                var y = -( (b.y - a.y) * (d.y - c.y) * (c.x - a.x)     
                            + (b.x - a.x) * (d.y - c.y) * a.y     
                            - (d.x - c.x) * (b.y - a.y) * c.y ) / denominator;    
            
                            return {    
                                x :  x,    
                                y :  y    
                            } 
                // if (     
                //     (x - a.x) * (x - b.x) <= 0 && (y - a.y) * (y - b.y) <= 0    
                       
                //      && (x - c.x) * (x - d.x) <= 0 && (y - c.y) * (y - d.y) <= 0    
                //     ){    
                  
                //     return {    
                //             x :  x,    
                //             y :  y    
                //         }    
                // }      
                return false    
                
        }  
        //定义点的结构体
        function point() {
            this.x = 0;
            this.y = 0;
        }
        //计算一个点是否在多边形里
        function isContain(p1, p2, p3, p4, p) {
            cx.beginPath();
            cx.moveTo(p1.x, p1.y);
            cx.lineTo(p2.x, p2.y);
            cx.lineTo(p3.x, p3.y);
            cx.lineTo(p4.x, p4.y);
            cx.closePath();
            return cx.isPointInPath(p.x, p.y);
        }
        // var cos = document.getElementById("aaRoad");
        function mouseChoose(left,top,fuc){
            
            cs.onmousedown = function (e) {
                var x = e.clientX - (cs.offsetLeft+left);
                var y = e.clientY - (cs.offsetTop+top);
    
                //调用
                var p = new point();
                p.x = x;
                p.y = y;
                var directionId = -1;
                var laneId = -1;
                var isInLane = false;
    
                for (var i in roadLanePointArray) {
                    if(roadLanePointArray[i].length<1) {
                        continue;
                    }
                    var startx1, starty1,startx2, starty2;
                    startx1 = parseFloat(roadPointArray[i][3].split(",")[0]);
                    starty1 = parseFloat(roadPointArray[i][3].split(",")[1]);
                    startx2 = parseFloat(roadPointArray[i][2].split(",")[0]);
                    starty2 = parseFloat(roadPointArray[i][2].split(",")[1]);
                    for(var j in roadLanePointArray[i]) {
                        if(j>=parseInt(roadLaneNumArray[i].split(",")[0])){
                            continue;
                        }
                        var p1 = new point();
                        p1.x = startx1;
                        p1.y = starty1;
                        var p2 = new point();
                        p2.x = startx2;
                        p2.y = starty2;
    
                        var p3 = new point();
                        p3.x = parseFloat(roadLanePointArray[i][j][1].split(",")[0]);
                        p3.y = parseFloat(roadLanePointArray[i][j][1].split(",")[1]);
    
                        var p4 = new point();
                        p4.x = parseFloat(roadLanePointArray[i][j][0].split(",")[0]);
                        p4.y = parseFloat(roadLanePointArray[i][j][0].split(",")[1]);
                        isInLane = isContain(p1, p2, p3, p4, p);
                        if (isInLane) {
                            directionId = i;
                            laneId = j;
                            selectRoadId = i;
                            selectLaneId = j;
                            fuc(selectRoadId,selectLaneId)
                            // d-1 == i ? $("#imgCon").show() : "";
                            break;
                        }
                        startx1 = p4.x;
                        starty1 = p4.y;
                        startx2 = p3.x;
                        starty2 = p3.y;
                    }
                    if (isInLane) {
                        break;
                    }else{
                        // $("#imgCon").hide()
                    }
                }
            }
        }
        // function selectImg(){
        //     $("#imgCon img").off().on("click",function(){
        //         roadLaneTypeArray[selectRoadId][selectLaneId] = $(this).attr("id");
        //         reDraw();
        //         noStandarDdierection();
        //         $("#imgCon").hide();
        //     })
    
        //     $("#closeImg").click(function(){
        //         $("#imgCon").hide();
        //     })
        // }
        function LaneTypeArray(roadLaneNumArray){
            var $roadLaneTypeArray = new Array(8);
    
            for (var i = 0; i < 8; i++) {
                $roadLaneTypeArray[i] = new Array();
                for(var j=0;j<parseInt(roadLaneNumArray[i].split(",")[0]);j++) {
                    $roadLaneTypeArray[i].push("e06");//1代表直行
                }
            }
            return $roadLaneTypeArray;
        }
    
        var results = noStandarDdierection();
        return results
    }

    return paint;
})