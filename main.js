let count = 1;
const divXY = document.getElementById("divXY");
let ctx;

//ctx.translate(250,250)
let divs = [document.getElementById("0")];
const formula = document.getElementById("formula");

addEventListener("load",(event)=>{
    setup();
});

function rect(x,y,w,h,clr="blue"){
    ctx.fillStyle = clr;
    ctx.fillRect(x-w/2,y-h/2,w,h);
}
function setup(){
    const canvas = document.getElementById("cnvs");
    ctx = canvas.getContext("2d");
    ctx.translate(250,250);
    ctx.scale(10,-10);
    draw();
}
function draw(){
    rect(0,0,500,500,"white");
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "grey";
    ctx.beginPath();
    ctx.moveTo(-250,0);
    ctx.lineTo(250,0);
    ctx.moveTo(0,-250);
    ctx.lineTo(0,250);
    ctx.stroke();
}
function addXY(){
    let newDiv = document.createElement("div");
    newDiv.id = count;
    let newLabelX = document.createElement("label");
    newLabelX.htmlFor = "x"+count;
    newLabelX.innerText = "x"+count+":";
    let newX = document.createElement("input");
    newX.id = "x"+count;
    let newLabelY = document.createElement("label");
    newLabelY.htmlFor = "y"+count;
    newLabelY.innerText = "y"+count+":";
    let newY = document.createElement("input");
    newY.id = "y"+count;
    newDiv.appendChild(newLabelX);
    newDiv.appendChild(newX);
    newDiv.appendChild(newLabelY);
    newDiv.appendChild(newY);
    divXY.appendChild(newDiv);
    divs.push(newDiv);
    count++;
}
function removeXY(){
    if(count==1)return;
    divXY.removeChild(divs.pop());
    count--;
}


function check(){
    let setX = new Set();
    let flag = true;
    divs.forEach((div)=>{
        let valueX = div.children[1].value;
        let valueY = div.children[3].value;
        if(flag && (valueY=="" ||valueX=="")){
            alert("Polja ne mogu biti prazna");
            flag = false;
            return;
        }
        if(flag && (isNaN(valueX) || isNaN(valueY))){
            alert("Unos nije ispravan");
            flag = false;
            return;
        }
        setX.add(Number(div.children[1].value));
    });
    
    if(flag && setX.size != count){
        alert("Svi x-evi moraju biti razliciti");
        flag = false;
    }
    return flag;
}

function determ(start = 0, ignore = 0, column = -1){
    if(start==count)return 1;
    let res = 0;
    let vis = 0;
    for(let i = 0;i<count;i++){
        if(ignore&(1<<i)){
            vis++;
            continue;
        }
        let val;
        if(column==i) val=Number(divs[start].children[3].value);
        else val = Math.pow(Number(divs[start].children[1].value), count-1-i);
        val *= determ(start+1, ignore|(1<<i), column);
        if((i+vis)%2)val*=-1;
        res+=val;
    }
    

    return res;
}

function calc(){
    if(check()==false)return;
    let a_ovi = [];
    let value = "P_"+count+"(x)=";
    draw();
    let detSistema = determ();
    for(let i =0; i<count; i++){
        let a=determ(0,0,i)/detSistema;
        a_ovi.push(a);
        if(a==0 && count-1-i)continue;
        if(i)value+="+";
        if(a!=1 || count-1-i==0)value+=a;
        if(count-1-i){
            value+="x";
            if(count-1-i!=1)value+="^"+(count-1-i);
        }
       
    }
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(-251,0);
    for(let i =-250; i<250;i+=0.5){
        let y = 0;
        for(let j=0;j<count;j++){
            y+=a_ovi[j]*Math.pow(i,count-1-j);
        }
        ctx.lineTo(i,y);
    }
    ctx.stroke();
    for(let i=0;i<count;i++){
        rect(Number(divs[i].children[1].value),Number(divs[i].children[3].value),1,1);
    }
    formula.innerText = "$$"+value+"$$";
    MathJax.typeset();
}