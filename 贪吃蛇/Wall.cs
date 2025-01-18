using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 贪吃蛇
{
    internal class Wall : GameObject
    {
        public Wall(int x,int y) 
        {
            this.x = x; 
            this.y = y;
        }

        public override void Draw()
        {
            Console.SetCursorPosition(this.x, this.y);
            Console.ForegroundColor=ConsoleColor.Red;
            Console.Write("■");
        }
    }
}
