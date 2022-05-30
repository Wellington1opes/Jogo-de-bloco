var canvas, ctx, ALTURA, LARGURA, frames = 0, maxPulos = 2, velocidade = 5, estadoAtual, record;

var estados = {
    jogar: 0,
    jogando: 1,
    perdeu: 2
},

chao = { //definir o chão que o objeto vai andar
    y: 350,
    altura: 50,
    cor: "#696969",

    desenha: function() {
        ctx.fillStyle = this.cor;
        ctx.fillRect(0, this.y, LARGURA, this.altura);
    }
}, 

bloco = { //formatar o bloco principal 
    x: 40,
    y: 0,
    altura: 40,
    largura: 40,
    cor: "#ff4e4e",
    gravidade: 1.5,
    velocidade: 0,
    forcaDoPulo: 22,
    qntPulos: 0,
    score: 0,

    atualiza: function() {
        this.velocidade += this.gravidade;
        this.y += this.velocidade;

        if(this.y > chao.y - this.altura && estadoAtual != estados.perdeu) { // para garantir q o bloco principal não irá ultrapassar o chão
            this.y = chao.y - this.altura;
            this.qntPulos = 0; //para os pulos sejam renovados
            this.velocidade = 0; 
        }
    },

    pula: function() {

        if(this.qntPulos < maxPulos) { //para limitar a quantidade de pulos
            this.velocidade = -this.forcaDoPulo;
            this.qntPulos++;
        }
    },

    reset: function() {
        this.velocidade = 0;
        this.y = 0;

        if(this.score > record) {
            localStorage.setItem("record", this.score); //vamos estar alterando ou registrando o record
            record = this.score;
        }

        this.score = 0;
    },

    desenha: function() {
        ctx.fillStyle = this.cor;
        ctx.fillRect(this.x, this.y, this.altura, this.largura);
    }
},

obstaculos =  {
    _obs: [],
    cor: ["#C0C0C0", "#F0E68C", "#FFFF00", "#FFC0CB", "#B0E0E6", "#DAA520", "#7CFC00", "#FF4500", "#DC143C"],
    tempoInsere: 0,

    insere: function() { //para inserir blocos
        this._obs.push({
            x: LARGURA, //gera o obstaculo no final da canvas
            largura: 20 + Math.floor(31 * Math.random()), //gera um número inteiro e aleatório
            altura: 30 + Math.floor(70 * Math.random()),
            cor: this.cor[Math.floor(9 * Math.random())]
        });

        this.tempoInsere = 15 + Math.floor(28 + Math.random());
    },

    atualiza: function() { //para inserir os blocos continuamente
        if(this.tempoInsere == 0) {
            this.insere();
        } else {
            this.tempoInsere--;
        }

        for(var i = 0, tam = this._obs.length; i < tam; i++) {
            var obs = this._obs[i];
            obs.x -= velocidade;
            
            if((bloco.x < obs.x + obs.largura) &&
                (bloco.x + bloco.largura >= obs.x) &&  
                (bloco.y + bloco.altura >= chao.y - obs.altura)) { //condições para colisao

                    estadoAtual = estados.perdeu;
        
            } else if(obs.x == 0) { 
                bloco.score++;

            } else if(obs.x <= -obs.largura) { //para excluir os obstaculos quando chegarem ao final da tela, para que parem de consumir dados
                this._obs.splice(i, 1);
                tam--;
                i--;
            }
        }
    },

    limpa: function() {
        this._obs = [];
    },

    desenha: function() {
        for(var i = 0, tam = this._obs.length; i < tam; i ++) {
            var obs = this._obs[i];
            ctx.fillStyle = obs.cor;
            ctx.fillRect(obs.x, chao.y - obs.altura, obs.largura, obs.altura);
        }
    }
};

function clique(event) {
    if(estadoAtual == estados.jogando) { //se o estado for jogando o clique fará com que o personagem pule
        bloco.pula();
    
    } else if(estadoAtual == estados.jogar) { //tela de inicio quando clicada trocar o status  para jogando
        estadoAtual = estados.jogando;

    } else if(estadoAtual == estados.perdeu && bloco.y >= 2 * ALTURA) { //quando perder aguardará alguns seundos para poder clicar na tela e o seu status trocará para tela de inicio
        estadoAtual = estados.jogar;
        obstaculos.limpa();
        bloco.reset(); //faz voltar para o nosso bloco inicial

    }
}

function main() {
    ALTURA = window.innerHeight; //retorna o tamanho da altura da janela do usuário
    LARGURA = window.innerWidth; //retorna o tamanho da largura da janela do usuário

    if(LARGURA >= 500) {
        LARGURA = 600;
        ALTURA = 400;
    }

    canvas = document.createElement("canvas");
    canvas.width = LARGURA;
    canvas.height = ALTURA;
    canvas.style.border = "1px solid #000";

    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas); //adiciona a variável canvas no corpo do html
    document.addEventListener("mousedown", clique);   //evento para verificar quando alguém clicar

    estadoAtual = estados.jogar;
    record = localStorage.getItem("record"); // para acessar o localStorage

    if(record == null)
        record = 0;

    roda();
}

function roda() {
    atualiza(); 
    desenha();

    window.requestAnimationFrame(roda); //irá rodar essa função sempre
}

function atualiza() {
    frames++;
    bloco.atualiza();

    if(estadoAtual == estados.jogando) { //caso o jogo já tenha começado atualizará os blocos

        obstaculos.atualiza();
    } 
}

function desenha() {
    ctx.fillStyle = "#1e90ff";
    ctx.fillRect(0, 0, LARGURA, ALTURA);  //cor de fundo da canvas
    ctx.fillStyle = '#fff';
    ctx.font = "50px Arial";
    ctx.fillText(bloco.score, 20, 45);

    if(estadoAtual == estados.jogar) { //para tela de inicio
        ctx.fillStyle = '#00FA9A';
        ctx.fillRect((LARGURA / 2) - 50, (ALTURA / 2) - 50, 100, 100)

    } else if(estadoAtual == estados.perdeu) { //para tela de loser
        ctx.fillStyle = '#FF0000';
        ctx.fillRect((LARGURA / 2) - 50, (ALTURA / 2) - 50, 100, 100)

        ctx.save();
        ctx.translate(LARGURA / 2, ALTURA / 2);
        ctx.fillStyle = "#E8E8E8";

        if(bloco.score > record) {
            ctx.fillText("New Record!", -150, -65);

        } else if(record < 10) {
            ctx.fillText("Record " + record, -99, -65);

        } else if(record >= 10 && record < 100) {
            ctx.fillText("Record " + record, -112, -65)

        } else {
            ctx.fillText("Record " + record, -125, -65)
        }
        
        if(bloco.score < 10) {

            ctx.fillText(bloco.score, -13, 19);
        } else if(bloco.score >= 10 && bloco.score < 100) {

            ctx.fillText(bloco.score, -26, 19);
        } else {
            ctx.fillText(bloco.score, -39, 19);
        }
        ctx.restore();
        
    } else if(estadoAtual == estados.jogando) { //para quando o jogo começar
        obstaculos.desenha();

    }

    chao.desenha();
    bloco.desenha();

}

main();