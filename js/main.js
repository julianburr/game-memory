// Colour Memory Game Core Script

(function($){
		
	$.fn.colourMemory = function(options){
		
		// Merge given options with default settings object
		var settings = $.extend({
			cardcnt : 16,
			cutname : 15
        }, options );
	
		// Create array for card values
		var cards = new Array();
		
		// Create array and helping counters for users card selection
		var selected = new Array(),
			selectioncnt = 0,
			cardsleft = settings.cardcnt;
		
		// Create timer vars for score and exact time measure
		var time = null,
			timer,
			starttime,
			realtime;
		
		// Create helping var for blocking content from actions
		var unclickable = false;
		
		
		/**************************************
		HELPING FUNCTIONS
		**************************************/
		
		// XBrowser Compability
		// Helping function to get current timestamp (if not already defined by browser!)
		if(!Date.now){
			Date.now = function(){ 
				return new Date().getTime(); 
			}
		}
		
		// Init card deck by adding values to array
		function initCards(){
			var counter = 0;
			var value = 1;
			$(".wrap-fields ul.fields").empty();
			for(var i=0; i<settings.cardcnt; i++){
				cards[i] = value;
				// Create list element for every card
				// I already load the cards into the DOM here to have the pictures in the browser cache!
				// The cards will be shuffled afterwards, so even if they are in the DOM the user does not know the final positions!
				// This could be avoided by using a colour array instead of images!!
				$(".wrap-fields ul.fields").append('<li class="field" data-index="' + i + '"><div class="card back"><img src="img/card_bg.gif" alt="Card Back" /></div><div class="card front"><img src="img/colour' + value + '.gif" alt="Colour ' + value + ' Front" /></div></li>');
				counter++;
				if(counter > 1){
					counter = 0;
					value++;
				}
			}
		}
			
		// Shuffle cards by randomly rearanging the values within the array!
		function shuffleCards() {
			var curr_index = cards.length, 
				temp_value, 
				rand_index;
			while (0 !== curr_index){
				// Pick random value
				rand_index = Math.floor(Math.random() * curr_index);
				curr_index--;
				// Swap the randomly picked value with the current one
				temp_value = cards[curr_index];
				cards[curr_index] = cards[rand_index];
				cards[rand_index] = temp_value;
			}
		}
		
		// Start game (shuffle cards, start timer)
		function gameStart(){
			shuffleCards();
			time = 0;
			starttime = Date.now();
			timer = setInterval(function(){
				time++;
				$(".info .timer .sec").text(time);
			}, 1000);
		}
		
		// Stop game (not neccesarily by winning!)
		function gameEnd(){
			realtime = Date.now() - starttime;
			// Round to 1 digit behind the comma
			realtime = Math.round(realtime / 1000 * 10) / 10;
			// Clear interval timer
			clearInterval(timer);
			$(".info .timer .sec").text(realtime);
			$(".info .timer .sectext").fadeIn(300);
			$("#popup-highscore b.score").html(realtime + " seconds");
			$("#popup-highscore input[name=score]").val(realtime);
		}
		
		// Reset game (show action animation, end game, reset timer, reset cards);
		function gameReset(){
			showAction("RESET!");
			if(timer) gameEnd();
			$(".info .timer .sec").text(0);
			$(".info .timer .sectext").hide();
			time = null;
			cardsleft = settings.cardcnt;
			$("#wrap-gameboard li.flip").removeClass("found selected flip");
			$("#wrap-gameboard li.hover").removeClass("hover");
		}
		
		// Show action text (zooming in and fading out on top of gameboard)
		function showAction(text){
			$(".actiontext").html(text).show().animate({
				"font-size" : "700%",
				"opacity" : 0
			}, 1300, function(){
				$(".actiontext").hide().css({
					"font-size" : "100%",
					"opacity" : 1
				});
			});
		}
		
		// AJAX interface
		// Get current high scores from database and write them in list
		function getHighscores(){
			$.ajax({
				"url" : "ajax/get_highscore.php",
				"dataType" : "json"
			}).done(function(content){
				$(".highscore ul.scores").empty();
				for(i=0; i<content.length; i++){
					var name = content[i].name;
					if(name.length > settings.cutname){
						name = "<span title='" + name + "'>" + name.substr(0,settings.cutname-1) + "...</span>";
					}
					$(".highscore ul.scores").append('<li><span class="name">' + name + '</span><span class="sec">' + content[i].score + '</span></li>');
				}
			});
		}
		
		// AJAX interface
		// Send name and score to save it in highscore database
		function sendScore(name, email, score){
			$.ajax({
				"url" : "ajax/submit_score.php",
				"data" : {
					"name" : name,
					"email" : email,
					"score" : score
				}
			}).done(function(){
				// Reload highscore list
				getHighscores();
			});	
		}
		
		// Show popup div and background
		function openPopup(id){
			id = "#popup-" + id;
			if($(id).length > 0){
				$("#popup-background").fadeIn(500).click(function(){
					hidePopup();
				});
				$(id).css({
					"opacity":0
				}).show();
				if($(id).outerHeight() < $(window).height()){
					$("#popup-" + id).css({
						"top" : ($(window).height() - $("#popup-" + id).outerHeight()) / 2 + "px"
					});
				} else {
					$(id).outerHeight($(window).height() - 20).css({ "top":"10px" });
				}
				$(id).hide().css({ "opacity":1 }).fadeIn(500);
			}
		}
		
		// Hide popup div(s) and background
		function hidePopup(){
			$("#popup-background").fadeOut(500);
			$(".popup").fadeOut(500);
		}
		
		
		/**************************************
		GAME LOGIC & USER INTERACTION
		**************************************/
		
		return this.each(function(){
			
			var game = $(this);
			
			// Start by iniializing the card deck
			initCards();
			
			// Get current high scores
			getHighscores();
			
			// Show action START on screen
			// The game doesn't really start yet, but I found it confusing putting it after the first card gets clicked...
			showAction("START!");
			
			// Handle click on card field
			game.find("ul.fields li.field").click(function(){
				// Is the board still blocked through other functions?
				if(unclickable) return;
				// Is the timer running? Otherwise start game!
				if(time == null) gameStart();
				// Assign jQuery objects to helping vars
				var clicked = $(this);
				var index = clicked.attr("data-index");
				// Check if card is selectable, if not, return
				if(clicked.hasClass("selected") || clicked.hasClass("found")) return;
				// Add front image to clicked card container
				clicked.find("div.front").first().html("<img src='img/colour" + cards[index] + ".gif'>");
				// And add flip class to trigger CSS animations
				clicked.addClass("selected flip");
				// Raise selection counter
				selectioncnt++;
				// ... and use it to determine necessary actions
				if(selectioncnt >= 2){
					// After selecting two cards, check if they match
					if(cards[selected.attr("data-index")] == cards[index]){
						// If they do, mark them as "found" and leave them open
						$("#wrap-gameboard li.selected").removeClass("selected").addClass("found");
						cardsleft -= 2;
						if(cardsleft <= 0){
							// If all matches have been found now, end game and show highscore popup
							gameEnd();
							openPopup("highscore");
							if($("#popup-highscore input[name=name]").val() == ""){
								$("#popup-highscore button").attr("disabled", true);
							}
						}
					} else {
						// If they don't match, show them for another second and then flip them back again
						// Use helping var to prevent further clicks during the timeout period!
						unclickable = true;
						setTimeout(function(){
							$("#wrap-gameboard li.selected").removeClass("selected flip");
							unclickable = false;
						}, 1300);
					}
					// Reset selection counter
					selectioncnt = 0;
				} else {
					// Save selected card in array
					selected = clicked;
				}
			});
			
			// Handle click on the restart button to trigger game's reset
			game.find(".restart button").click(function(){
				gameReset();
				return false;
			});
			
			// Handle key down actions to navigate with arrow keys and enter key
			$("body").keydown(function(e){
				// Skip for any other key than the above mentioned
				if(e.key == "ArrowLeft" || e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == "ArrowRight"){
					// Save hovered element in var
					var hovered = $("#wrap-gameboard li.hover"),
						newhovered;
					// If no object found, select first card as new selection
					if(hovered.length <= 0){
						$("#wrap-gameboard li:first").addClass("hover");
						return false;
					}
					// Prevent default events (like page scrolling) to ensure smooth user experience
					e.preventDefault();
					// Select new selected element from pressed key
					switch(e.key){
						case "ArrowRight": newhovered = hovered.next("li.field"); break;
						case "ArrowLeft" : newhovered = hovered.prev("li.field"); break;
						case "ArrowUp" : newhovered = hovered.prev("li.field").prev("li.field").prev("li.field").prev("li.field"); break;
						case "ArrowDown" : newhovered = hovered.next("li.field").next("li.field").next("li.field").next("li.field"); break;
					}
					// Set new classes
					if(newhovered.length > 0){
						hovered.removeClass("hover");
						newhovered.addClass("hover");
					}
					// Return false to prevent any further actions through key down
					return false;
				} else if(e.key == "Enter"){
					var hovered = $("#wrap-gameboard li.hover");
					if(hovered.length > 0){
						// Trigger click on currently hovered card
						hovered.click();
						// Return false to prevent any further actions through key down
						return false;
					}
				}
				return true;
			});
			
			// Remove key helper class when really hovered
			$("#wrap-gameboard li").hover(function(){
				$("#wrap-gameboard li.hover").removeClass("hover");
			});
			
			// Handle button click to open rules popup
			game.find(".rules button").click(function(){
				openPopup("rules");
				return false;
			});
			
			// Handle button click inside popups
			$("#popup-highscore button.send").click(function(){
				var name = $("#popup-highscore input[name=name]").val();
				var score = $("#popup-highscore input[name=score]").val();
				var email = $("#popup-highscore input[name=email]").val();
				if(name > ""){
					sendScore(name, email, score);
					hidePopup("highscore");
				}
				return false;
			});
			
			$("#popup-highscore button.cancel").click(function(){
				hidePopup("highscore");
				return false;
			});
			
			$("#popup-rules button").click(function(){
				hidePopup("rules");
				return false;
			});
			
			$("#popup-highscore input[name=name]").keyup(function(){
				if($(this).val() == ""){
					$("#popup-highscore button").attr("disabled",true);
				} else {
					$("#popup-highscore button").attr("disabled",false);
				}
			});
		});
		
	}
	
})(jQuery);