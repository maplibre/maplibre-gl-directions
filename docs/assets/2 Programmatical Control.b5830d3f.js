import{f as b,k as s,l as x,q as w,o as W,c as C,a as k,w as m,g as t,F as M,i as _,t as N}from"./vendor.27d3f5ae.js";import{A as R}from"./AppSidebar.272aa2b4.js";import{m as S,s as A,M as B}from"./maplibre-gl-directions.es.126a2c32.js";import"./index.6e764dd8.js";const D=t("small",null,[t("strong",null,"Note"),_(" that interactivity is disabled for this example")],-1),F={class:"flex flex-col gap-2 items-center"},V=t("p",null,"Set waypoints to a predefined set",-1),q=["disabled"],E={class:"flex flex-col gap-2 items-center"},z=t("p",null,"Add a random waypoint at some random index",-1),G=["disabled"],O={class:"flex flex-col gap-2 items-center"},P=t("p",null,"Delete a random waypoint",-1),T=["disabled"],j={class:"flex flex-col gap-2 items-center"},H=t("p",null,"Clear the map from all the stuff added by the plugin",-1),I=["disabled"],X=b({setup(J){const f=s(x().matched[0].name),o=s(),a=s(),l=s();w(()=>{const e=new S.Map({container:l.value,style:A,center:[-74.1197632,40.6974034],zoom:11});e.on("load",()=>{o.value=e,a.value=new B(o.value,{requestOptions:{alternatives:"true"}})})});function h(){var e;(e=a.value)==null||e.setWaypoints([[-74.21349031181673,40.704951524836275],[-74.19666749687558,40.738517300855904],[-74.16611177177786,40.76634583723629],[-74.07169801445302,40.719004374548206],[-73.99170381279369,40.725509319065594],[-73.98071748466812,40.762445342516145]])}function v(){var i,d,c,r;const e=(i=o.value)==null?void 0:i.getBounds(),n=(d=o.value)==null?void 0:d.getCenter();if(e&&n){const u=e.getEast()-e.getWest(),p=e.getSouth()-e.getNorth();(r=a.value)==null||r.addWaypoint([n.lng-u/2+u*Math.random(),n.lat-p/2+p*Math.random()],((c=a.value)==null?void 0:c.waypoints.length)*Math.random()|0)}}function y(){var e,n;(n=a.value)==null||n.removeWaypoint(((e=a.value)==null?void 0:e.waypoints.length)*Math.random()|0)}function g(){var e;(e=a.value)==null||e.clear()}return(e,n)=>(W(),C(M,null,[k(R,null,{title:m(()=>[_(N(f.value),1)]),default:m(()=>[D,t("div",F,[V,t("button",{disabled:!o.value||!a.value,onClick:h},"Set Waypoints",8,q)]),t("div",E,[z,t("button",{disabled:!o.value||!a.value,onClick:v},"Add Waypoint",8,G)]),t("div",O,[P,t("button",{disabled:!o.value||!a.value,onClick:y},"Delete Waypoint",8,T)]),t("div",j,[H,t("button",{disabled:!o.value||!a.value,onClick:g},"Clear",8,I)])]),_:1}),t("div",{ref_key:"mapRef",ref:l,class:"shadow-xl"},null,512)],64))}});export{X as default};
