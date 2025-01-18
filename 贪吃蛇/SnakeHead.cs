using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 贪吃蛇
{
    
    internal class SnakeHead : GameObject
    { 
        public Direction direction=Direction.nodirection;
        public SnakeHead()
        {
            x = 20;
            y = 10;
        }

        public override void Draw()
        {
            Console.SetCursorPosition(this.x,this.y);
            Console.ForegroundColor = ConsoleColor.Blue;
            Console.Write("★");
        }
    }
}
