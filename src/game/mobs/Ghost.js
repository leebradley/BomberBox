import WanderingEntity from 'game/mobs/WanderingEntity';
import Tile from 'game/entities/Tile';
import MoneyBlock from 'game/entities/MoneyBlock';
import Util from 'game/util';

import {
  TILE_STYLE,
  TILE_TRAIT,
} from 'game/const';

const Ghost = function(world, x, y) {
   var self = this,
      m_tile = new Tile(world),
      wanderingEntity = new WanderingEntity(world, m_tile),
      iTimoutFast = 450,
      iTimeoutSlow = 1000;

   m_tile.setStyle(TILE_STYLE.TILE_GHOST);
   m_tile.setPosition(x, y),
   world.createTile(m_tile);

   m_tile.setOnFrag(() => {
      world.dropAfterFrag(m_tile, (x, y) => {
         Util.chances({
            1 : function() {
               new MoneyBlock(world, x, y, 4);
            },
            2 : function() {
               new MoneyBlock(world, x, y, 3);
            }
         });
      });
      m_tile.destroy();
   });

   m_tile.setInteract((tile) => {
      if (tile.dieBy) tile.dieBy('Ghost');
   });

   self.runAmok = function() {
      if (m_tile.isDestroyed()) return;

      var iRadius = 8,

         playerPath = Util.pathfind(world, TILE_TRAIT.TRAIT_PLAYER,
            [TILE_TRAIT.TRAIT_BLOCKING_COMPLETE, TILE_TRAIT.TRAIT_MONSTER_BLOCKING, TILE_TRAIT.TRAIT_BOMB, TILE_TRAIT.TRAIT_BLOCKING],
            [false, false, false, 3],
            iRadius, m_tile.x, m_tile.y);

      if (playerPath) {
         var coordinates = world.getPosFromIndex(playerPath[1]);
         if (world.locationHasTraits(coordinates[0], coordinates[1], [TILE_TRAIT.TRAIT_BLOCKING])) {
            wanderingEntity.setTickSpeed(iTimeoutSlow);
            m_tile.setStyle(TILE_STYLE.TILE_GHOST_INCOGNITO);
            wanderingEntity.move(coordinates[0], coordinates[1], 300);
         } else {
            wanderingEntity.setTickSpeed(iTimoutFast);
            m_tile.setStyle(TILE_STYLE.TILE_GHOST);
            wanderingEntity.move(coordinates[0], coordinates[1], 200);
         }
      } else {
         m_tile.setStyle(TILE_STYLE.TILE_GHOST);
         wanderingEntity.setTickSpeed(iTimoutFast);
         wanderingEntity.runAmok();
      }
   };

   wanderingEntity.startMoving(self.runAmok);
};

export default Ghost;
