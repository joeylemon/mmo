var quests = [
     new Quest(
          "Steve's Dilemma",
          10,
          [
               new KillEntityObjective(Entity.CRAB, 5),
               new KillEntityObjective(Entity.SKELETON, 5),
               new TalkToNPCObjective("Shirtless Steve")
          ],
          1000,
          300
     ),
     new Quest(
          "Cocky Coders",
          2,
          [
               new TalkInChatObjective("Question: what is a variable?", "named location in storage"),
          ],
          100,
          25
     ),
     new Quest(
          "Apple Pickers",
          5,
          [
               new PickupItemObjective("apple", 5),
               new TalkToNPCObjective("Farmer Joe")
          ],
          500,
          100
     ),
     new Quest(
          "The Village's Demise",
          15,
          [
               new KillEntityObjective(Entity.OGRE, 1),
               new TalkToNPCObjective("Shirtless Steve")
          ],
          2000,
          1000
     ),
     new Quest(
          "Hitmen",
          7,
          [
               new KillPlayerObjective(),
               new TalkToNPCObjective("Agent Smith")
          ],
          500,
          500
     )
];

function getQuestID(title){
	for(var i = 0; i < quests.length; i++){
          if(quests[i].getTitle() == title){
               return i;
          }
     }
}

function getQuestNPC(id){
	for(var i = 0; i < all_npcs.length; i++){
		var npc = all_npcs[i];
		if(npc.quest && npc.getQuestID() == id){
			return npc;
		}
	}
}

function getOgreEntity(){
	return game.getEntity(ogreID);
}
