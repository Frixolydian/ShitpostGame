var tData;

$.ajax({ 
    url: '../assets/templates/data.json',
    dataType: 'json',  
    async: false, 
    success: function(json){ 
        tData = json;
    } 
});

var makeMeme = function(template, image, canv){
	var canvas = document.getElementById(canv);
	var data = tData['template' + template];
	var context = canvas.getContext('2d');
	var memeImage = new Image();
	var memeTemplate = new Image();
	memeTemplate.src = '../assets/templates/template' + template + '.png';
	memeImage.src = '../assets/images/image' + image + '.png';

	var imageLoad = function(){
		document.getElementById(canv).width = memeTemplate.width;
		document.getElementById(canv).height = memeTemplate.height;
		if(!data.overlay){
			context.drawImage(memeTemplate, 0, 0, memeTemplate.width, memeTemplate.height);
		}
		if (memeImage.width/memeImage.height*data.height < data.width){
			//adjust height
			context.drawImage(memeImage, data.x1 + (data.width - memeImage.width/memeImage.height*data.height) / 2, data.y1, memeImage.width/memeImage.height*data.height, data.height);
		}
		else{
			//adjust width
			context.drawImage(memeImage, data.x1, data.y1 + (data.height - memeImage.height/memeImage.width*data.width) / 2, data.width, memeImage.height/memeImage.width*data.width);
		}
		if(data.overlay){
			context.drawImage(memeTemplate, 0, 0, memeTemplate.width, memeTemplate.height);
		}
	}
	memeImage.onload = function() {
		imageLoad();
	};
	memeTemplate.onload = function() {
		imageLoad();
	};
}