$(document).ready(function(){
	var numMsgTL = 0;
	var numMsgU = 0;
	var numMsgMTL = 0;
	var pendientes = false;
	var update = false;
	var tlineLoaded = '';
	init();


	function init(){
		//creamos un div para meter los mensajes del timeline
		var div1 = $("<div class='box-body chat' id='chat-box'></div>");
		//creamos un div para meter los mensajes de my timeline
		var div2 = $("<div class='box-body chat' id='my-chat-box'></div>");
		//Y los añadimos vacíos
		$(".box.box-success").append(div1);
		$(".box.box-success").append(div2);
	}


	$("#timeline").click(function (e) {
	  	e.preventDefault();
			changeLogoIni();
      getTimeLine();
	});


	$("#update").click(function (e) {
			e.preventDefault();
			getUpdate();
			if(update){
				changeLogoIni();
			}
	});


	$("#mytimeline").click(function (e) {
			e.preventDefault();
			changeLogoIni();
			getMyTimeLine();
	});


	var getTimeLine = function(){
		//Descargamos los mensajes de timeline.json y los introducimos en el dom
		//if (tlineLoaded==''){//Si todavía no hemos cargado nada
			$.getJSON("json/timeline.json")
			.done(function(data){
				numMsgTL = data.messages.length;
				var html = buildMessages(data, "timeline", numMsgTL);
				document.getElementById('my-chat-box').innerHTML='';//necesito vaciar my-chatbox
				if (document.getElementById('chat-box').innerHTML==''){
					$("#chat-box").append(html);
				}
				createHandlers(data, "timeline");
			})
			.fail(function(jqxhr, status, error){
				var htmlErr = "<p>Request Failed: " + status + ": " + error + "</p>"
				$("#chat-box").append(htmlErr);
			})
			//Ahora comprobamos si tenemos mensajes pendientes en update.json y mostramos la advertencia
			$.getJSON("json/update.json")
			.done(function(data){
				if (data == 0){
					pendientes = false;
					document.getElementById("msgPendientes").innerHTML = '';
				}
				else{
					pendientes = true;
					numMsgU = data.messages.length;
					document.getElementById("msgPendientes").innerHTML = numMsgU;
				}
			})
		//}
		//else{
			//document.getElementById('chat-box').innerHTML=tlineLoaded;
		//}
	}

	var getUpdate = function(){
		//Descargamos los mensajes de update.json y los introducimos en el dom
		//if(update == false){ //para que solo se actualicen los mensajes una vez
			$.getJSON("json/update.json")
			.done(function(data){
				numMsgU = data.messages.length;
				var html = buildMessages(data, "update", numMsgU);
				document.getElementById('my-chat-box').innerHTML='';//necesito vaciar my-chatbox
				if (document.getElementById('chat-box').innerHTML!=''){
					$("#chat-box").prepend(html); //sin borrar lo que había
					tlineLoaded = html;
					//update = true;
					numMsgU = 0; //Ya no queremos que nos salga el aviso
					document.getElementById("msgPendientes").innerHTML = '';
				}
				createHandlers(data, "update");
			})
			.fail(function(jqxhr, status, error){
				var htmlErr = "<p>Request Failed: " + status + ": " + error + "</p>"
				$("#chat-box").append(htmlErr);
			})
		//}
	}

	var getMyTimeLine = function(){
		//Descargamos los mensajes de myline.json y los introducimos en el dom
		$.getJSON("json/myline.json")
		.done(function(data){
			numMsgMTL = data.messages.length;
			var html = buildMessages(data, "myline", numMsgMTL);
			tlineLoaded = document.getElementById('chat-box').innerHTML;
			document.getElementById('chat-box').innerHTML='';//necesito vaciar chatbox
			if (document.getElementById('my-chat-box').innerHTML==''){
				$("#my-chat-box").append(html);
			}
			createHandlers(data, "myline");
		})
		.fail(function(jqxhr, status, error){
			var htmlErr = "<p>Request Failed: " + status + ": " + error + "</p>"
			$("#chat-box").append(htmlErr);
		})
	}

	function buildMessages(data, type, num){
		//Creamos el html para cada uno de los mensajes junto con su botón para mostrar el contenido del mensaje completo
		var html = "";
		for (var i = 0; i < num; i++){
			var msg =  data.messages[i];
			html += "<div class='item col-sm-12'>";
			html += "<img src='" + msg.picture + "' alt='user image' class='online'>";
	    html += "<p class='message'>";
	    html += "<a href='#' class='name'>";
	    html += "<small class='text-muted pull-rigth'><i class='fa fa-clock-o'></i>" + msg.date + ": </small>";
			html += msg.author + " - " + msg.title;
	    html += "</a></p>";
			html += "<input class='buttonShowMore' id='" + type + "-mostrarMsg-" + String(i) + "' type='button' value='See all the message'>";
			html += "<div id='mostrarMsg-"+ String(i) + "-" + String(type) + "'></div>";
			html += "</div>";
		}
		return html;
	}

	function createHandlers(data, type){
		//Creamos un manejador para cada botón "Show more" asociado a cada mensaje cargado,
		//que nos introduzca el contenido del mensaje de cada usuario al pulsar el botón "show more"
		var ident = "";
		for (var i = 0; i < data.messages.length; i++){
			var msg =  data.messages[i];
			ident = "#"+ type + "-mostrarMsg-"+ i.toString(); //boton
			$(ident).click(function(e) {
				var elems = e.currentTarget.id.split('-'); //(p.e.) e.currentTarget.id = timeline-mostrarMsg-1
				var filejson = elems[0];
				var numMsg = elems[2];
				$.getJSON("json/"+ filejson + ".json")
				.done(function(data){
					var idBoton = "#"+ filejson + "-mostrarMsg-"+ numMsg;
					$(idBoton).remove(); //al mostrar el mensaje eliminamos el botón
					var msg =  data.messages[numMsg];
					html = "<p class='mostrarMsg' align='justify'>" + msg.content + "</p>";
					if (msg.img){
						html += "<img class='mostrarMsg' src='" + msg.img + "' id='picture'>";
					}
					if (msg.video){
						html += "<iframe class='mostrarMsg' src='"+ msg.video + "' frameborder='0' allowfullscreen></iframe>";
					}
					var thisIdent = "#mostrarMsg-"+numMsg+"-"+filejson+"";
					$(thisIdent).html(html);
				})
			})
		}
	}


	$("#msgPendientes").hover(function(){
		//Para mostrar una nota con los mensajes pendientes de cargar
		if (numMsgU != 0){
			var msgInfo = "Tiene " + String(numMsgU) + " mensajes nuevos. Cuando se encuentre en 'Timeline' pulse 'Update Timeline' para cargarlos.";
			document.getElementById("nota-informativa").innerHTML = msgInfo;
			$("#nota-informativa").show().delay(2000).hide(8000);
		}
	})

	var changeLogoIni = function(){
		//Para cambiar el formato del logo del contenedor central
		$("#logoIni").css("width", "35%");
		$("#logoIni").css("heigth", "35%");
		$("#logoIni").css("margin", "0px 0px 0px 300px");
		$("#logoIni").css("left", "-35%");
		$("#logoIni").attr("src", "imgs/logo_transp.png");
	}

	$("#toggleMenuButton").click(function (e) {
		//Para mostrar un logo adecuado cuando se oculta o se muestra la barra a la izda
		if ($("#logo").attr("src") == "imgs/logo_transp_peq.png") {
			$("#logo").attr("src", "imgs/logo_transp_peq_S.png");
			$("#logo").css("width", "35px");
			$("#logo").css("height", "35px");
			$("#logo").css("margin", "5px 0px 0px -7px");
		} else if ($("#logo").attr("src") == "imgs/logo_transp_peq_S.png") {
			$("#logo").attr("src", "imgs/logo_transp_peq.png");
			$("#logo").css("width", "85%");
			$("#logo").css("height", "100%");
			$("#logo").css("margin", "0px 100px 0px 0px");
		}
	});


});
