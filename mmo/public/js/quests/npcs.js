var store_npcs = [
     new StoreNPC(1531, 1480, MapType.MAIN, StoreType.ARMORY),
     new StoreNPC(1531, 1223, MapType.MAIN, StoreType.HEALER)
];

var all_npcs = [
     new NPC(
          "Shirtless Steve",
          0,
          "beachnpc",
          1454,
          1749,
          MapType.MAIN,
          [
               "Hello there, traveler.",
               "How are you today?",
               "I have a job for you!",
               "See all of these mobs around me?",
               "I'm too scared to fight them alone.",
               "Get rid of them, and I'll reward you!"
          ],
          [
               "Thank you so much for killing those mobs.",
               "I have another urgent quest for you...",
               "however, you must be much stronger.",
               "Reach level 15, and maybe buy better armor."
          ],
          [
               "Hello there!",
               "Hmm, I have a quest for you.",
               "However, you need to be a little stronger!",
               "Come back to me when you're level 10."
          ],
          [
               "Get to killing, traveler!",
               "I will reward you... once you've finished!"
          ],
          [
               "Hey there!",
               "I would ask you to do a job for me...",
               "But you seem to be busy already.",
               "Maybe once you're done!"
          ]
     ),
     new NPC(
          "Shirtless Steve",
          3,
          "beachnpc",
          1454,
          1749,
          MapType.MAIN,
          [
               "Thanks for killing those mobs!",
               "Our town has a much bigger problem now...",
               "The troll has returned!",
               "Decades ago, he was chased from our village.",
               "Now, he seeks revenge!",
               "He's killed many of our own.",
               "Our warriors have already tried killing him...",
               "However, none of them returned!",
               "You have shown great abilities...",
               "You are the only one who can kill him!",
               "Get rid of the troll, and you will become a legend!"
          ],
          [
               "I can't believe it...",
               "You've killed the troll!",
               "He will never again step foot in our village!",
               "You are our hero!"
          ],
          [
               "Hello there!",
               "Hmm, I have a quest for you.",
               "However, you need to be a little stronger!",
               "Come back to me when you're level 15."
          ],
          [
               "Have you killed the troll yet?",
               "It won't be long until he starts killing all of us!"
          ],
          [
               "Hey there!",
               "I would ask you to do a job for me...",
               "But you seem to be busy already.",
               "Maybe once you're done!"
          ]
     ),
     new NPC(
          "Nerdy Nate",
          1,
          "coder",
          225,
          340,
          MapType.MAIN,
          [
               "Greetings, fellow programmer.",
               "I hear you think you're a better coder than me?",
               "Bahaha! Fool.",
               "Tell you what...",
               "If you can answer me this question, I'll admit defeat.",
               "What is a variable?"
          ],
          [
               "My word... I suppose you are the better coder.",
               "I admit my defeat to you.",
               "You don't have to rub it in."
          ],
          [
               "Greetings, young traveler.",
               "Pass along, you're unworthy of my quests.",
               "Try coming back when you're level 2."
          ],
          [
               "Answer my question: what is a variable?",
               "Come on now, I haven't got all day.",
               "Type out your answer in chat, any day now!",
               "Simply press ENTER and type your answer!"
          ],
          [
               "Hello there, foolish coder!",
               "I would challenge your intelligence...",
               "But you seem to be busy already.",
               "Maybe once you're done!"
          ]
     ),
     new NPC(
          "Farmer Joe",
          2,
          "desertnpc",
          1367,
          376,
          MapType.MAIN,
          [
               "Howdy there, partner!",
               "I was just about to gather me up some dinner.",
               "Problem is... the darned bats stole my fresh apples!",
               "This old man ain't got the strength to fight no more.",
               "Maybe you could get my apples for me, what d'ya say?"
          ],
          [
               "Now that's what I'm talking 'bout!",
               "Sally'll be so proud of me...",
               "I'll see ya around kid."
          ],
          [
               "These darn bats!",
               "Hey you, if you ever reach level 5...",
               "me 'n you could have a little chat."
          ],
          [
               "Have you gotten the food yet?",
               "The bats stole the apples from me!",
               "I'll pay ya to get them back, I swear on it!"
          ],
          [
               "Howdy partner!",
               "You seem a little busy, don't ya.",
               "I won't bother you with my worries."
          ]
     )
];
var npcs = new Array();

function updateNPCs(){
     npcs = new Array();
     npcs = npcs.concat(store_npcs);
     for(var i = 0; i < all_npcs.length; i++){
		var n = all_npcs[i];
          if(n.quest){
               npcs.push(getBestNPC(n.getName()));
          }
     }
}

function getAmountOfNPC(name){
	var total = 0;
	for(var i = 0; i < all_npcs.length; i++){
		var n = all_npcs[i];
		if(n.quest && n.getName() == name){
			total++;
		}
	}
	return total;
}

function getHighestLevelNPC(name){
     var npc;
     var highest = 0;
	for(var i = 0; i < all_npcs.length; i++){
		var n = all_npcs[i];
          if(n.quest){
               var level = quests[n.getQuestID()].getMinimumLevel();
               if(n.getName() == name && level > highest){
                    npc = n;
                    highest = level;
               }
          }
	}
     return npc;
}

function getBestNPC(name){
	var npc;
	for(var i = 0; i < all_npcs.length; i++){
		var n = all_npcs[i];
		if(n.quest){
			var level = quests[n.getQuestID()].getMinimumLevel();
			if(!me().hasCompletedQuest(n.getQuestID()) && n.getName() == name && me().getLevel() <= level){
				npc = n;
                    break;
			}
		}
	}
	if(!npc){
		npc = getHighestLevelNPC(name);
	}
	return npc;
}
