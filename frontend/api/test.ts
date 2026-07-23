import { print_string } from './mensagem.js';

interface frontend {
    title: string;
    code: number;
}

const teste: frontend = {
    title: 'titulo',
    code: 123
}

alert(JSON.stringify(teste, null, 2));
print_string('teste');