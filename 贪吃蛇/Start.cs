using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 贪吃蛇
{
    internal class Start:StartOrEndScenceBasic
    {

        public Start() 
        {
            title = "贪吃蛇";
            select = "开始游戏";
        }
        public override void ChangeScene()
        {
            Console.Clear();
            GameDate.counts = 0;
            GameDate.snakes[0] = new SnakeHead();
            GameDate.counts++;
            Game.nowScene = new Gaming();
        }
    }
}
