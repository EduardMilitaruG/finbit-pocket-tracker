import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/SupabaseService';
import { User, Transaction } from '../types/User';
import { Plus, ArrowDown, ArrowUp, FileDown, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Sparkles } from 'lucide-react';
import Profile from './Profile';
import Markets from './Markets';
import ConexionBancaria from './ConexionBancaria';
import SavingsGoals from './SavingsGoals';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [transacciones, setTransacciones] = useState<Transaction[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [tipo, setTipo] = useState<'Ingreso' | 'Gasto'>('Gasto');
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('');
  const { toast } = useToast();
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'profile' | 'markets' | 'conexion' | 'savings'>('dashboard');

  useEffect(() => {
    cargarTransacciones();
  }, [user.id]);

  const cargarTransacciones = async () => {
    setCargando(true);
    try {
      const transaccionesCargadas = await supabaseService.getTransactions(user.id);
      setTransacciones(transaccionesCargadas);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      toast({
        title: "Error",
        description: "Error al cargar las transacciones",
        variant: "destructive"
      });
    } finally {
      setCargando(false);
    }
  };

  const agregarTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const nuevaTransaccion = await supabaseService.addTransaction(descripcion, parseFloat(cantidad), tipo);
      setTransacciones([nuevaTransaccion, ...transacciones]);
      setDescripcion('');
      setCantidad('');
      toast({
        title: "¡Transacción agregada!",
        description: "La transacción se ha agregado correctamente"
      });
    } catch (error) {
      console.error('Error al agregar transacción:', error);
      toast({
        title: "Error",
        description: "Error al agregar la transacción",
        variant: "destructive"
      });
    } finally {
      setCargando(false);
    }
  };

  const exportarCSV = () => {
    const csvContent = [
      'Fecha,Descripción,Tipo,Cantidad',
      ...transacciones.map(t => [
        new Date(t.date).toLocaleDateString('es-ES'),
        `"${t.description}"`,
        t.type,
        t.amount.toString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `finbit-transacciones-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const transaccionesFiltradas = transacciones.filter(transaccion =>
    transaccion.description.toLowerCase().includes(filtro.toLowerCase())
  );

  const totalIngresos = transacciones.filter(t => t.type === 'Ingreso').reduce((acc, t) => acc + t.amount, 0);
  const totalGastos = transacciones.filter(t => t.type === 'Gasto').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIngresos - totalGastos;

  const cambiarAVista = (vista: 'dashboard' | 'profile' | 'markets' | 'conexion' | 'savings') => {
    setVistaActual(vista);
  };

  return (
    <div className="min-h-screen bg-white rounded-3xl shadow-2xl p-8 border border-white/20relative overflow-hidden">
      <div className="absolute inset-0 opacity-50  bg-[url(/dots.png)] bg-repeat  dark:opacity-20" />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-800 mb-1">
              <span className="font-extralight">Hola,</span> {user.username}
            </h1>
            <p className="text-gray-600 font-light">
              Bienvenido a tu panel de control financiero
            </p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={onLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50 dark:bg-blue-950 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Ingresos</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Total de ingresos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${totalIngresos.toFixed(2)}
              </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500 dark:text-gray-400">
              <ArrowUp className="mr-2 h-4 w-4 text-green-500" />
              Incremento mensual
            </CardFooter>
          </Card>

          <Card className="bg-red-50 dark:bg-red-950 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Gastos</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Total de gastos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${totalGastos.toFixed(2)}
              </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500 dark:text-gray-400">
              <ArrowDown className="mr-2 h-4 w-4 text-red-500" />
              Disminución mensual
            </CardFooter>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Balance</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Ingresos menos gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${balance.toFixed(2)}
              </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500 dark:text-gray-400">
              <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
              Salud financiera
            </CardFooter>
          </Card>
        </div>

        <div className="flex space-x-4 mb-6">
          <Button onClick={() => cambiarAVista('dashboard')} variant={vistaActual === 'dashboard' ? 'default' : 'outline'}>
            Dashboard
          </Button>
          <Button onClick={() => cambiarAVista('profile')} variant={vistaActual === 'profile' ? 'default' : 'outline'}>
            Perfil
          </Button>
          <Button onClick={() => cambiarAVista('markets')} variant={vistaActual === 'markets' ? 'default' : 'outline'}>
            Mercados
          </Button>
          <Button onClick={() => cambiarAVista('conexion')} variant={vistaActual === 'conexion' ? 'default' : 'outline'}>
            Conexión Bancaria
          </Button>
          <Button onClick={() => cambiarAVista('savings')} variant={vistaActual === 'savings' ? 'default' : 'outline'}>
            Metas de Ahorro
          </Button>
        </div>

        {vistaActual === 'dashboard' && (
          <>
            <form onSubmit={agregarTransaccion} className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    type="text"
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    type="number"
                    id="cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Cantidad"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <select
                    id="tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as 'Ingreso' | 'Gasto')}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Gasto">Gasto</option>
                    <option value="Ingreso">Ingreso</option>
                  </select>
                </div>
                <div>
                  <Button type="submit" disabled={cargando}>
                    {cargando ? 'Agregando...' : 'Agregar Transacción'}
                  </Button>
                </div>
              </div>
            </form>

            <div className="flex justify-between items-center mb-4">
              <Input
                type="text"
                placeholder="Buscar transacción..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <Button variant="secondary" size="sm" onClick={exportarCSV}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar a CSV
              </Button>
            </div>

            {cargando ? (
              <p>Cargando transacciones...</p>
            ) : (
              <Table>
                <TableCaption>A list of your recent transactions.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaccionesFiltradas.map((transaccion) => (
                    <TableRow key={transaccion.id}>
                      <TableCell className="font-medium">{new Date(transaccion.date).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>{transaccion.description}</TableCell>
                      <TableCell>
                        {transaccion.type === 'Ingreso' ? (
                          <Badge variant="outline">Ingreso</Badge>
                        ) : (
                          <Badge variant="destructive">Gasto</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">${transaccion.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}

        {vistaActual === 'profile' && (
          <Profile user={user} onLogout={onLogout} />
        )}

        {vistaActual === 'markets' && (
          <Markets />
        )}

        {vistaActual === 'conexion' && (
          <ConexionBancaria userId={user.id} onTransaccionesImportadas={() => {}} />
        )}

        {vistaActual === 'savings' && (
          <SavingsGoals userId={user.id} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
