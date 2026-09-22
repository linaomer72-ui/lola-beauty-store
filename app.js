const SUPABASE_URL='https://ukmjptafczxhdcqcpxrv.supabase.co';
const SUPABASE_KEY='sb_publishable_j6Zj02g3nNxzeqXt5vvnmw_LuHlR2tJ';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let products=[],settings={},cart=[];
const $=id=>document.getElementById(id);
async function load(){
 const {data:p,error}=await sb.from('products').select('*').eq('active',true).order('created_at',{ascending:false});
 if(error){$('productsGrid').innerHTML='<div class="loading">تعذر تحميل المنتجات. تأكدي من إعدادات Supabase.</div>';return}
 products=p||[]; const {data:s}=await sb.from('site_settings').select('*').limit(1).maybeSingle(); settings=s||{};
 applySettings(); renderProducts();
 sb.channel('store-live').on('postgres_changes',{event:'*',schema:'public',table:'products'},load).on('postgres_changes',{event:'*',schema:'public',table:'site_settings'},load).subscribe();
}
function applySettings(){document.documentElement.style.setProperty('--pink',settings.primary_color||'#E9A7BD');document.documentElement.style.setProperty('--lav',settings.secondary_color||'#C8B8E8');$('delivery').textContent=settings.delivery_info_ar||'مصر والسودان';$('payment').textContent=settings.payment_info_ar||'المحفظة الإلكترونية';$('whatsappLink').href='https://wa.me/'+(settings.whatsapp||'201096605331');$('year').textContent=new Date().getFullYear();if(settings.logo_url)$('logo').src=settings.logo_url}
function renderProducts(){const f=$('categoryFilter').value;const list=f==='all'?products:products.filter(x=>x.category===f);$('productsGrid').innerHTML=list.length?list.map(p=>`<article class="product"><img src="${p.image_url||'assets/lola-logo.jpg'}"><div class="product-body"><h3>${esc(p.name_ar)}</h3><p>${esc(p.description_ar||'')}</p><div class="price">${Number(p.price_egp).toFixed(2)} جنيه</div><button class="btn" onclick="addToCart('${p.id}')">أضيفي إلى السلة</button></div></article>`).join(''):'<div class="loading">لا توجد منتجات حاليًا.</div>'}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
window.addToCart=id=>{const p=products.find(x=>x.id===id);if(!p)return;const x=cart.find(x=>x.id===id);x?x.qty++:cart.push({...p,qty:1});renderCart();$('cartModal').classList.remove('hidden')};
function renderCart(){$('cartCount').textContent=cart.reduce((a,x)=>a+x.qty,0);$('cartItems').innerHTML=cart.length?cart.map(x=>`<div class="cart-row"><img src="${x.image_url||'assets/lola-logo.jpg'}"><div><b>${esc(x.name_ar)}</b><div>${Number(x.price_egp).toFixed(2)} جنيه × ${x.qty}</div></div><button onclick="removeCart('${x.id}')">حذف</button></div>`).join(''):'<p>السلة فارغة.</p>';$('cartTotal').textContent=cart.reduce((a,x)=>a+x.price_egp*x.qty,0).toFixed(2)}
window.removeCart=id=>{cart=cart.filter(x=>x.id!==id);renderCart()};
$('categoryFilter').onchange=renderProducts;$('cartBtn').onclick=()=>{$('cartModal').classList.remove('hidden');renderCart()};$('closeCart').onclick=()=>$('cartModal').classList.add('hidden');$('sendOrder').onclick=()=>{if(!cart.length)return alert('السلة فارغة');const n=$('customerName').value.trim(),ph=$('customerPhone').value.trim(),note=$('customerNote').value.trim();let msg='طلب جديد من Lola Beauty%0A%0A';cart.forEach(x=>msg+=`• ${x.name_ar} × ${x.qty} = ${(x.price_egp*x.qty).toFixed(2)} جنيه%0A`);msg+=`%0Aالإجمالي: ${$('cartTotal').textContent} جنيه%0Aالاسم: ${encodeURIComponent(n)}%0Aالهاتف: ${encodeURIComponent(ph)}%0Aملاحظات: ${encodeURIComponent(note)}`;window.open('https://wa.me/'+(settings.whatsapp||'201096605331')+'?text='+msg,'_blank')};load();
