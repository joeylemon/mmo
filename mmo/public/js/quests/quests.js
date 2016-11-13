var quests = [
     new Quest(
          "Tale of the Shirtless Man",
          3,
          [],
          [
               new KillEntityObjective(Entity.SKELETON, 5),
               new KillEntityObjective(Entity.BAT, 5),
               new TalkToNPCObjective("Shirtless Steve")
          ],
          1000
     )
];

function getQuestID(title){
	for(var i = 0; i < quests.length; i++){
          if(quests[i].getTitle() == title){
               return i;
          }
     }
	return undefined;
}
