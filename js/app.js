const data=[
{serial:"001",edition:"Beta #0",price:"100000"},
{serial:"002",edition:"Beta #0",price:"100000"}];
const c=document.getElementById('cards');
if(c){data.forEach(x=>{let d=document.createElement('div');d.className='card';d.innerHTML=`<h3>*${x.serial}</h3><p>${x.edition}</p><p>Rp ${x.price}</p><button>Buy</button>`;c.appendChild(d);});}
