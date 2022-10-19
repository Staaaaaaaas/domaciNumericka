// broj tacaka, na pocetku je 1
let count = 1;
// div element koji sadrzi ostale divove
const divXY = document.getElementById("divXY");
// kontekst platna, na njemu se crta
const canvas = document.getElementById("cnvs");
const ctx = canvas.getContext("2d");
// lista svih divova, koji sadrze input za X i Y koordinate, na pocetku ima jedan div
let divs = [document.getElementById("base")];
// div u kom ce se pisati jednacina polinoma
const equation = document.getElementById("equation");
let scaledWidth = 250/8;
let a_ovi =[];

// podesavanje platna kada se sajt ucita
addEventListener("load",(event)=>{
    setup();
});


addEventListener("keypress",(event)=>{
    if(event.key == "Enter"){
        calc();
        return;
    }
    if(event.target.tagName == "INPUT")return;
    if(event.key == "-"){
        ctx.scale(1/2,1/2); 
        scaledWidth*=2;
        drawFunction();
    }
    else if(event.key == "+" || event.key=="="){
        ctx.scale(2, 2);
        scaledWidth/=2;
        drawFunction();
    }
});

// crtanje pravougaoinka sa zadatim koordinatama centra, 
// visinom, sirinom i bojom
function rect(x,y,w,h,clr="blue"){
    ctx.fillStyle = clr;
    ctx.fillRect(x-w/2,y-h/2,w,h);
}
// podesavanje platna
function setup(){
    
    
    // pomeranje konteksta, jer je inace 
    // (0,0) gornji levi ugao, sada je to centar
    // jer je visina i sirina platna 500px
    ctx.translate(250,250);
    // "zoom" platna, odnosno promena razmere
    // negativna za y jer inace y opada od gore ka dole
    ctx.scale(8,-8);
    
    draw();
}
// crtanje grafika
function draw(){
    // pozadina
    rect(0,0,2*scaledWidth,2*scaledWidth,"white");

    ctx.strokeStyle = "#aaaaaa"
    ctx.lineWidth = 0.1;
    ctx.beginPath();
    for(let i = Math.floor(-scaledWidth); i< Math.ceil(scaledWidth); i+=1){
        ctx.moveTo(i,-scaledWidth);
        ctx.lineTo(i,scaledWidth);
    }
    for(let i = Math.floor(-scaledWidth); i< Math.ceil(scaledWidth); i+=1){
        ctx.moveTo(-scaledWidth,i);
        ctx.lineTo(scaledWidth,i);
    }
    ctx.stroke();

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "grey";

    ctx.beginPath();
    // crtanje x-ose
    ctx.moveTo(-scaledWidth,0);
    ctx.lineTo(scaledWidth,0);
    // crtanje y-ose
    ctx.moveTo(0,-scaledWidth);
    ctx.lineTo(0,scaledWidth);
    
    ctx.stroke();

    
}

function drawFunction(){
    draw();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 0.3;
    
    
    ctx.beginPath();
    for(let i =-scaledWidth; i<scaledWidth;i+=(2*scaledWidth)/1000000){
        let y = 0;
        for(let j=0;j<count;j++){
            y+=a_ovi[j]*Math.pow(i,count-1-j);
        }
        ctx.lineTo(i,y);
    }
    ctx.stroke();
    // crtanje zadatih tacaka
    for(let i=0;i<count;i++){
        rect(Number(divs[i].children[1].value),Number(divs[i].children[3].value),1,1);
    }
}

// dodavanje tacke
function addXY(){
    // novi div za unos podataka tacke
    let newDiv = document.createElement("div");
    // labela i unos za X
    let newLabelX = document.createElement("label");
    newLabelX.htmlFor = "x"+count;
    newLabelX.innerText = "x"+count+":";
    let newX = document.createElement("input");
    newX.classList.add("inputXY");

    // labela i unos za Y
    let newLabelY = document.createElement("label");
    newLabelY.htmlFor = "y"+count;
    newLabelY.innerText = "y"+count+":";
    let newY = document.createElement("input");
    newY.classList.add("inputXY");

    newDiv.appendChild(newLabelX);
    newDiv.appendChild(newX);

    newDiv.appendChild(newLabelY);
    newDiv.appendChild(newY);

    divXY.appendChild(newDiv);
    divs.push(newDiv);

    count++;
}
// oduzimanje tacke
function removeXY(){
    // ne sme da bude manje od 1 tacke
    if(count==1)return;
    divXY.removeChild(divs.pop());
    count--;
}

// provera ispravnosti unosa
function check(){
    // setX - skup vrednosti X, ne sadrzi duplikate
    let setX = new Set();
    // flag - rezultat provere, true-ispravni podaci, false-neispravni
    let flag = true;
    divs.forEach((div)=>{
        
        let valueX = div.children[1].value;
        let valueY = div.children[3].value;
        // polja moraju imati vrednost
        if(flag && (valueY=="" ||valueX=="")){
            alert("Поља не могу бити празна");
            flag = false;
            return;
        }
        // polja moraju biti broj
        if(flag && (isNaN(valueX) || isNaN(valueY))){
            alert("Унете вредности нису бројеви");
            flag = false;
            return;
        }
        // vrednost X se dodaje u skup setX
        setX.add(Number(div.children[1].value));
    });
    // ako je velicina setX manja, znaci ima duplikata, sto ne sme :(
    if(flag && setX.size != count){
        alert("Сви x-еви морају бити различити");
        flag = false;
    }
    return flag;
}

// REKURZIVNO racunanje determinante, koristim laplasov razvoj, mislim da nema
// efikasnijeg nacina, slozenost je svakako faktorijelska jer moramo proci kroz sve
// permutacije :(
function determ(start = 0, ignore = 0, column = -1){
    // start - pocetna vrsta

    // ignore - bitmaska, odnosno broj ciji setovani bitovi (u binarnom zapisu) 
    // predstavljaju kolone koje "ignorisemo", laplasov razvoj kao. 
    // Primer: ignore = 5 = 0b0101, dakle kolone 0 i 2 se ignorisu

    // column - to se koristi pri racunu determinanti po nepoznatim
    // predstavlja redni broj kolone koja ce biti zamenjena y vrednostima
    // za determinantu sistema je -1

    // baza indukcije, determinanta dimenzija 0x0 je 1
    if(start==count)return 1;

    // res - vrednost determinante
    // vis - broj "preskocenih" kolona, bitno za algebarski komplement
    let res = 0;
    let vis = 0;
    for(let i = 0;i<count;i++){
        // ovako se koriste bitmaske, proverava se vredonst i-tog bita
        // (1 ignorisemo kolonu : 0 ne ignorisemo kolonu)
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
// ovo je crtanje grafika i ispisivanje formule
function calc(){
    // ako podaci nisu korektno upisani, prekida se funkcija
    if(check()==false)return;
    // a_ovi - skup svih koeficijenata polinoma
    a_ovi = [];

    // value - LaTeX jednacina, ko zna zna 
    let value = "P_"+(count-1)+"(x)=";
    let detSistema = determ();
    let plus = false;
    for(let i =0; i<count; i++){
        // Kramerovo pravilo
        let a=determ(0,0,i)/detSistema;

        a_ovi.push(a);

        // ovo proverava da ispis bude lep
        // npr ne ispisuje se 0x ili x^1 se pise samo kao x itd...
        if(a==0 && count!=1)continue;
        if(plus)value+="+";
        if(a!=1 || count-1-i==0){
            value+=a;
            plus = true;
        }
        if(count-1-i){
            value+="x";
            if(count-1-i!=1)value+="^"+(count-1-i);
            plus = true;
        }
       
    }
    // crtanje grafika
    drawFunction();
    equation.innerText = "$$"+value+"$$";
    // render LateX jednacine
    MathJax.typeset();
}